/** Uji aturan kuota tanpa database — getQuotaState murni fungsi. */
import { getQuotaState } from '../src/server/billing/quota';

const now = new Date('2026-08-27T00:00:00Z');
const days = (n: number) => new Date(now.getTime() + n * 86_400_000);

type Case = { nama: string; user: Parameters<typeof getQuotaState>[0] };

const base = {
  role: 'USER' as const,
  isGuest: false,
  plan: 'TRIAL' as const,
  subscriptionStatus: 'TRIALING' as const,
  trialEndsAt: days(7),
  generateCount: 3,
  quotaResetAt: null,
};

const cases: Case[] = [
  { nama: 'trial normal', user: base },
  { nama: 'trial habis hari', user: { ...base, trialEndsAt: days(-1) } },
  { nama: 'trial habis kuota', user: { ...base, generateCount: 10 } },
  { nama: 'trial hari & kuota habis', user: { ...base, trialEndsAt: days(-1), generateCount: 10 } },
  {
    nama: 'PRO aktif, 40/200',
    user: { ...base, plan: 'PRO', subscriptionStatus: 'ACTIVE', trialEndsAt: null, generateCount: 40, quotaResetAt: days(12) },
  },
  {
    nama: 'PRO aktif, kuota habis',
    user: { ...base, plan: 'PRO', subscriptionStatus: 'ACTIVE', trialEndsAt: null, generateCount: 200, quotaResetAt: days(12) },
  },
  {
    nama: 'PRO kuota habis TAPI jendela lewat',
    user: { ...base, plan: 'PRO', subscriptionStatus: 'ACTIVE', trialEndsAt: null, generateCount: 200, quotaResetAt: days(-1) },
  },
  {
    nama: 'PRO menunggak',
    user: { ...base, plan: 'PRO', subscriptionStatus: 'PAST_DUE', trialEndsAt: null, generateCount: 5, quotaResetAt: days(12) },
  },
  {
    nama: 'BUSINESS aktif (unlimited)',
    user: { ...base, plan: 'BUSINESS', subscriptionStatus: 'ACTIVE', trialEndsAt: null, generateCount: 999, quotaResetAt: days(12) },
  },
  { nama: 'tamu belum pakai', user: { ...base, isGuest: true, trialEndsAt: null, generateCount: 0 } },
  { nama: 'tamu sudah pakai jatahnya', user: { ...base, isGuest: true, trialEndsAt: null, generateCount: 1 } },
  { nama: 'OWNER walau trial kedaluwarsa', user: { ...base, role: 'OWNER', trialEndsAt: days(-30), generateCount: 5000 } },
  {
    nama: 'OWNER walau langganan mati',
    user: { ...base, role: 'OWNER', plan: 'BASIC', subscriptionStatus: 'CANCELED', trialEndsAt: null, generateCount: 5000 },
  },
];

for (const { nama, user } of cases) {
  const s = getQuotaState(user, now);
  const sisa = s.remaining < 0 ? '∞' : String(s.remaining);
  console.log(
    `${(s.allowed ? 'BOLEH ' : 'TOLAK ').padEnd(6)} ${nama.padEnd(34)} sisa ${sisa.padStart(3)}  ${s.reason ?? ''}`,
  );
}
