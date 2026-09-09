import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { APP } from '@/config/app';

export async function POST(req: Request) {
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
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Owner.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, newPassword = 'Instadeck123' } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID target wajib diisi.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { passwordHash },
      select: { email: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: `Password untuk ${updatedUser.email} berhasil direset menjadi: "${newPassword}".`,
      newPassword,
    });
  } catch (error: any) {
    console.error('[Admin Reset Password Error]:', error);
    return NextResponse.json({ error: 'Gagal mereset password pengguna.' }, { status: 500 });
  }
}
