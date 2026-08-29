import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { APP } from '@/config/app';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    const isOwner =
      userEmail === APP.ownerEmail ||
      (userEmail && APP.ownerEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (session?.user as any)?.role === 'OWNER';

    if (!session?.user || !isOwner) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Owner.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, newPassword = 'Newsly12345' } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID target wajib diisi.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await db.user.update({
      where: { id: targetUserId },
      data: { passwordHash },
      select: { email: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: `Password untuk ${user.email} berhasil direset menjadi: "${newPassword}".`,
      newPassword,
    });
  } catch (error: any) {
    console.error('[Admin Reset Password Error]:', error);
    return NextResponse.json({ error: 'Gagal mereset password pengguna.' }, { status: 500 });
  }
}
