import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Kata sandi baru minimal harus 8 karakter.' }, { status: 400 });
    }

    const user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true, email: true },
    });

    // Jika akun memiliki password lama (bukan login Google saja), verifikasi password lama
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Kata sandi lama wajib diisi.' }, { status: 400 });
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Kata sandi lama yang Anda masukkan salah.' }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui dengan aman!',
    });
  } catch (error: any) {
    console.error('[Change Password Error]:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
