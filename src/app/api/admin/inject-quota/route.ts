import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { APP } from '@/config/app';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    // Pastikan hanya Owner yang bisa mengeksekusi
    const isOwner =
      userEmail === APP.ownerEmail ||
      (userEmail && APP.ownerEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (session?.user as any)?.role === 'OWNER';

    if (!session?.user || !isOwner) {
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

    const parsedQuota = Number(quotaAmount) || 100;
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const targetPlan =
      plan === 'AGENCY'
        ? 'BUSINESS'
        : plan === 'STARTER'
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
