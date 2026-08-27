import type { Plan } from '@prisma/client';
import { db } from '@/server/db';
import { nextResetDate } from '@/server/billing/quota';
import { PLANS, type PaidPlan } from '@/config/plans';

export type ActivationResult = {
  plan: Plan;
  status: 'ACTIVE';
  quotaLimit: number;
  resetsAt: Date;
};

/**
 * STUB BILLING — belum ada pembayaran sungguhan.
 *
 * Fungsi ini yang nanti dipanggil oleh webhook Midtrans/Xendit setelah
 * pembayaran terkonfirmasi. Bentuk perubahannya sengaja dibuat final sekarang
 * (plan, status, jendela kuota) supaya menyambungkan payment gateway nanti
 * hanya soal memanggilnya dari handler webhook — bukan merombak model data.
 *
 * Yang BELUM ada dan harus menyusul bersama gateway:
 *  - verifikasi tanda tangan webhook
 *  - idempotensi per order id (webhook bisa dikirim berkali-kali)
 *  - tabel transaksi untuk audit
 *  - penanganan gagal bayar dan perpanjangan otomatis
 */
export async function activateSubscription(userId: string, plan: PaidPlan): Promise<ActivationResult> {
  const definition = PLANS[plan];
  const resetsAt = nextResetDate();

  await db.user.update({
    where: { id: userId },
    data: {
      plan,
      subscriptionStatus: 'ACTIVE',
      // Kuota mulai dari nol saat berlangganan — pemakaian trial tidak
      // dibawa ke periode berbayar.
      generateCount: 0,
      quotaResetAt: resetsAt,
      trialEndsAt: null,
    },
  });

  return { plan, status: 'ACTIVE', quotaLimit: definition.quota, resetsAt };
}
