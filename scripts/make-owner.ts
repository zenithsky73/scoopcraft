/**
 * Membuat atau menaikkan sebuah akun menjadi pemilik aplikasi (kuota tanpa batas).
 *
 *   npx tsx scripts/make-owner.ts <email> [password]
 *
 * - Kalau akunnya belum ada, akun baru dibuat (password wajib diisi).
 * - Kalau sudah ada, perannya dinaikkan jadi OWNER tanpa mengubah password.
 *
 * Sengaja berupa skrip terminal, bukan halaman web: menaikkan peran lewat
 * HTTP berarti ada endpoint yang bisa disalahgunakan kalau otorisasinya
 * salah sekali saja. Akses ke terminal server sudah jadi izin tertinggi.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const [emailRaw, password] = process.argv.slice(2);

  if (!emailRaw) {
    console.error('Pakai: npx tsx scripts/make-owner.ts <email> [password]');
    process.exit(1);
  }

  const email = emailRaw.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    const user = await db.user.update({
      where: { email },
      data: {
        role: 'OWNER',
        subscriptionStatus: 'ACTIVE',
        // Trial tidak relevan lagi untuk akun pemilik.
        trialEndsAt: null,
        quotaResetAt: null,
      },
    });

    console.log(`✓ ${user.email} sekarang OWNER — kuota tanpa batas.`);
    console.log('  Password tidak diubah.');
    return;
  }

  if (!password) {
    console.error(`Akun ${email} belum ada. Sertakan password untuk membuatnya:`);
    console.error(`  npx tsx scripts/make-owner.ts ${email} <password>`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password minimal 8 karakter.');
    process.exit(1);
  }

  const user = await db.user.create({
    data: {
      email,
      name: 'Pemilik Scoopcraft',
      passwordHash: await bcrypt.hash(password, 10),
      role: 'OWNER',
      plan: 'BUSINESS',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: null,
      quotaResetAt: null,
    },
  });

  console.log(`✓ Akun pemilik dibuat: ${user.email}`);
  console.log('  Kuota tanpa batas, tanpa masa trial.');
  console.log('  Masuk lewat /login dengan email dan password di atas.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
