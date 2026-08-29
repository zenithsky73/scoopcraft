import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { APP } from '@/config/app';

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    const isOwner =
      userEmail === APP.ownerEmail ||
      (userEmail && APP.ownerEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (session?.user as any)?.role === 'OWNER';

    if (!session?.user || !isOwner) {
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
