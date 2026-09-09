import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { APP } from '@/config/app';

export async function GET() {
  try {
    const viewer = await getViewer();
    const user = viewer?.user;

    const isOwner =
      user?.role === 'OWNER' ||
      user?.email === 'zenoalvaro75@gmail.com' ||
      user?.email === APP.ownerEmail ||
      (user?.email && APP.ownerEmail.toLowerCase() === user.email.toLowerCase()) ||
      (process.env.OWNER_EMAIL && user?.email && process.env.OWNER_EMAIL.toLowerCase() === user.email.toLowerCase());

    if (!user || !isOwner) {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Owner.' },
        { status: 403 }
      );
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        subscriptionStatus: true,
        generateCount: true,
        createdAt: true,
        trialEndsAt: true,
        isGuest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('[Get Admin Users Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mengambil data pengguna.' },
      { status: 500 }
    );
  }
}
