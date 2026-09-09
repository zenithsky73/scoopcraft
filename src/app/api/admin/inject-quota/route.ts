import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { APP } from '@/config/app';

export async function POST(req: Request) {
  try {
    const viewer = await getViewer();
    const user = viewer?.user;

    // Pastikan hanya Owner yang bisa mengeksekusi
    const isOwner =
      user?.role === 'OWNER' ||
      user?.email === 'zenoalvaro75@gmail.com' ||
      user?.email === APP.ownerEmail ||
      (user?.email && APP.ownerEmail.toLowerCase() === user.email.toLowerCase()) ||
      (process.env.OWNER_EMAIL && user?.email && process.env.OWNER_EMAIL.toLowerCase() === user.email.toLowerCase());

    if (!user || !isOwner) {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Owner / Master Admin.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { targetEmail, plan = 'PRO', quotaAmount = 100 } = body;

    if (!targetEmail || typeof targetEmail !== 'string') {
      return NextResponse.json(
        { error: 'Email target wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = targetEmail.trim().toLowerCase();

    // Cari user berdasarkan email
    const targetUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: `Pengguna dengan email "${cleanEmail}" belum terdaftar di platform. Minta pengguna mendaftar/login terlebih dahulu.`,
        },
        { status: 404 }
      );
    }

    // ─── KASUS 1: BATALKAN PAKET / RESET KE TRIAL ───
    if (plan === 'TRIAL' || plan === 'CANCEL') {
      await db.user.update({
        where: { id: targetUser.id },
        data: {
          plan: 'TRIAL',
          subscriptionStatus: 'CANCELED',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari trial
        },
      });

      return NextResponse.json({
        success: true,
        message: `Paket untuk ${cleanEmail} berhasil dibatalkan dan dikembalikan ke status Free Trial.`,
        user: {
          id: targetUser.id,
          email: cleanEmail,
          plan: 'TRIAL',
          status: 'CANCELED',
        },
      });
    }

    // ─── KASUS 2: SUNTIK PAKET BERBAYAR ───
    const parsedQuota = Number(quotaAmount) || 100;
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const targetPlan =
      plan === 'AGENCY' || plan === 'BUSINESS'
        ? 'BUSINESS'
        : plan === 'STARTER' || plan === 'BASIC'
        ? 'BASIC'
        : 'PRO';

    // Update User Plan & Status
    await db.user.update({
      where: { id: targetUser.id },
      data: {
        plan: targetPlan,
        subscriptionStatus: 'ACTIVE',
        role: plan === 'OWNER' ? 'OWNER' : targetUser.role,
        trialEndsAt: nextMonth,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menyuntikkan paket ${plan} (${parsedQuota} kuota) untuk ${cleanEmail}!`,
      user: {
        id: targetUser.id,
        email: cleanEmail,
        plan: targetPlan,
        quota: parsedQuota,
      },
    });
  } catch (error: any) {
    console.error('[Inject Quota Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
