import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Cek apakah akun terdaftar
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.isGuest) {
      // Demi keamanan, tetap beri respons sukses agar tidak bisa menebak email terdaftar
      return NextResponse.json({
        success: true,
        message: 'Jika email Anda terdaftar, tautan reset kata sandi telah disiapkan.',
      });
    }

    // Buat token acak 32 bytes (64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // Berlaku 1 jam

    // Simpan di VerificationToken
    await db.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: cleanEmail,
          token,
        },
      },
      update: { token, expires },
      create: {
        identifier: cleanEmail,
        token,
        expires,
      },
    });

    // Mengembalikan URL reset untuk akses langsung
    const resetUrl = `/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: 'Tautan reset kata sandi berhasil dibuat.',
      resetUrl,
    });
  } catch (error: any) {
    console.error('[Forgot Password Error]:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
