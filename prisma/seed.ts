import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const email = 'demo@scoopcraft.test';
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Demo Scoopcraft',
      passwordHash,
      plan: 'TRIAL',
      subscriptionStatus: 'TRIALING',
      trialEndsAt: new Date(Date.now() + 14 * 86_400_000),
      generateCount: 3,
    },
  });

  console.log(`Seed selesai — login: ${user.email} / password123`);

  // Akun pemilik dibuat kalau OWNER_EMAIL dan OWNER_PASSWORD diisi di .env.
  // Tanpa keduanya, langkah ini dilewati diam-diam supaya seed tetap aman
  // dijalankan di lingkungan mana pun.
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD;

  if (!ownerEmail) return;

  if (!ownerPassword || ownerPassword.length < 8) {
    console.log(`Lewati akun pemilik: OWNER_PASSWORD belum diisi (minimal 8 karakter).`);
    console.log(`Bisa juga lewat terminal: npm run owner ${ownerEmail} <password>`);
    return;
  }

  const owner = await db.user.upsert({
    where: { email: ownerEmail },
    update: { role: 'OWNER', subscriptionStatus: 'ACTIVE', trialEndsAt: null, quotaResetAt: null },
    create: {
      email: ownerEmail,
      name: 'Pemilik Scoopcraft',
      passwordHash: await bcrypt.hash(ownerPassword, 10),
      role: 'OWNER',
      plan: 'BUSINESS',
      subscriptionStatus: 'ACTIVE',
    },
  });

  console.log(`Akun pemilik siap — ${owner.email} (kuota tanpa batas)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
