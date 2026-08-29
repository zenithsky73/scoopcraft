import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token reset tidak valid.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password baru minimal harus 8 karakter.' }, { status: 400 });
    }

    // Cari token di VerificationToken
    const verificationRecord = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.' },
        { status: 400 }
      );
    }

    // Periksa masa berlaku
    if (new Date() > new Date(verificationRecord.expires)) {
      await db.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { error: 'Tautan reset kata sandi telah kedaluwarsa. Silakan ajukan ulang.' },
        { status: 400 }
      );
    }

    const email = verificationRecord.identifier;

    // Hash password baru
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await db.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Hapus token yang sudah digunakan
    await db.verificationToken.delete({ where: { token } }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru.',
    });
  } catch (error: any) {
    console.error('[Reset Password Error]:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
