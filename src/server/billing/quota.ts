import type { Prisma, User } from '@prisma/client';
import { db } from '@/server/db';
import { TRIAL, GUEST } from '@/config/trial';
import { quotaForPlan, PLAN_RESET_DAYS } from '@/config/plans';
import { daysUntil } from '@/lib/utils';

export type QuotaReason = 'TRIAL_EXPIRED' | 'QUOTA_EXHAUSTED' | 'SUBSCRIPTION_INACTIVE' | 'GUEST_LIMIT' | null;

export type QuotaState = {
  allowed: boolean;
  reason: QuotaReason;
  isTrial: boolean;
  isOwner: boolean;
  isGuest: boolean;
  plan: User['plan'];
  daysLeft: number;
  used: number;
  /** -1 = tanpa batas */
  limit: number;
  /** -1 = tanpa batas */
  remaining: number;
  /** Kapan hitungan pemakaian bulanan direset. null untuk trial dan owner. */
  resetsAt: Date | null;
};

export class QuotaError extends Error {
  readonly reason: Exclude<QuotaReason, null>;
  readonly state: QuotaState;

  constructor(state: QuotaState) {
    super(QUOTA_MESSAGES[state.reason ?? 'QUOTA_EXHAUSTED']);
    this.name = 'QuotaError';
    this.reason = state.reason ?? 'QUOTA_EXHAUSTED';
    this.state = state;
  }
}

export function isQuotaError(err: unknown): err is QuotaError {
  return err instanceof QuotaError;
}

type QuotaUser = Pick<
  User,
  'role' | 'plan' | 'subscriptionStatus' | 'trialEndsAt' | 'generateCount' | 'quotaResetAt' | 'isGuest'
>;

/** Jendela kuota bulanan sudah lewat? Pemakaian dihitung ulang dari nol. */
function windowExpired(user: QuotaUser, now: Date) {
  return user.plan !== 'TRIAL' && !!user.quotaResetAt && user.quotaResetAt <= now;
}

/**
 * Satu-satunya sumber kebenaran soal "boleh generate atau tidak".
 * Dipakai API route, server component, dan QuotaMeter — jangan duplikasi
 * logikanya di tempat lain.
 */
export function getQuotaState(user: QuotaUser, now = new Date()): QuotaState {
  // Pemilik aplikasi tidak terikat trial maupun kuota. Dicek paling awal
  // supaya tidak ada cabang lain yang bisa menguncinya.
  if (user.role === 'OWNER') {
    return {
      allowed: true,
      reason: null,
      isTrial: false,
      isOwner: true,
      isGuest: false,
      plan: user.plan,
      daysLeft: 0,
      used: user.generateCount,
      limit: -1,
      remaining: -1,
      resetsAt: null,
    };
  }

  // Tamu punya jalur sendiri: tanpa batas hari, hanya jumlah percobaan.
  if (user.isGuest) {
    const remaining = Math.max(0, GUEST.quota - user.generateCount);
    return {
      allowed: remaining > 0,
      reason: remaining > 0 ? null : 'GUEST_LIMIT',
      isTrial: false,
      isOwner: false,
      isGuest: true,
      plan: user.plan,
      daysLeft: 0,
      used: user.generateCount,
      limit: GUEST.quota,
      remaining,
      resetsAt: null,
    };
  }

  const isTrial = user.plan === 'TRIAL';
  const limit = quotaForPlan(user.plan, TRIAL.quota);
  const used = windowExpired(user, now) ? 0 : user.generateCount;
  const remaining = limit < 0 ? -1 : Math.max(0, limit - used);
  const daysLeft = isTrial ? daysUntil(user.trialEndsAt, now) : 0;

  const base = {
    isTrial,
    isOwner: false,
    isGuest: false,
    plan: user.plan,
    daysLeft,
    used,
    limit,
    remaining,
    resetsAt: isTrial ? null : user.quotaResetAt,
  };

  if (isTrial) {
    const daysOut = TRIAL.mode !== 'QUOTA_ONLY' && daysLeft <= 0;
    const quotaOut = TRIAL.mode !== 'DAYS_ONLY' && remaining === 0;

    if (daysOut) return { ...base, allowed: false, reason: 'TRIAL_EXPIRED' };
    if (quotaOut) return { ...base, allowed: false, reason: 'QUOTA_EXHAUSTED' };
    return { ...base, allowed: true, reason: null };
  }

  if (user.subscriptionStatus !== 'ACTIVE') {
    return { ...base, allowed: false, reason: 'SUBSCRIPTION_INACTIVE' };
  }
  if (remaining === 0) {
    return { ...base, allowed: false, reason: 'QUOTA_EXHAUSTED' };
  }
  return { ...base, allowed: true, reason: null };
}

export async function getQuotaStateForUser(userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  return getQuotaState(user);
}

/**
 * Memeriksa kuota lalu memotongnya dalam satu transaksi.
 *
 * Digabung menjadi satu operasi supaya dua request bersamaan tidak sama-sama
 * lolos pemeriksaan sebelum salah satunya sempat menambah hitungan. Dipanggil
 * dari createRun, bukan dari route — jadi tidak ada jalur pembuatan run yang
 * bisa melewatkannya.
 */
export async function consumeQuota(tx: Prisma.TransactionClient, userId: string, now = new Date()) {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const state = getQuotaState(user, now);

  if (!state.allowed) throw new QuotaError(state);
  if (state.isOwner) {
    // Tetap dihitung untuk keperluan statistik, tanpa batas apa pun.
    await tx.user.update({ where: { id: userId }, data: { generateCount: { increment: 1 } } });
    return state;
  }

  if (windowExpired(user, now)) {
    await tx.user.update({
      where: { id: userId },
      data: { generateCount: 1, quotaResetAt: nextResetDate(now) },
    });
    return state;
  }

  await tx.user.update({ where: { id: userId }, data: { generateCount: { increment: 1 } } });
  return state;
}

export function nextResetDate(from = new Date()) {
  return new Date(from.getTime() + PLAN_RESET_DAYS * 86_400_000);
}

export const QUOTA_MESSAGES: Record<Exclude<QuotaReason, null>, string> = {
  TRIAL_EXPIRED: `Masa trial ${TRIAL.durationDays} hari sudah berakhir. Konten lama tetap bisa dilihat dan diunduh.`,
  QUOTA_EXHAUSTED: 'Kuota generate sudah habis. Konten lama tetap bisa dilihat dan diunduh.',
  SUBSCRIPTION_INACTIVE: 'Langganan belum aktif. Aktifkan untuk mulai generate lagi.',
  GUEST_LIMIT: 'Percobaan gratis sudah terpakai. Daftar gratis untuk lanjut — konten yang sudah kamu buat ikut terbawa.',
};
