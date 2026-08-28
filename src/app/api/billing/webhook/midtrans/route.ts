import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyMidtransSignature } from '@/server/billing/midtrans';
import { activateSubscription } from '@/server/billing/activate-subscription';
import type { PaidPlan } from '@/config/plans';

export const runtime = 'nodejs';

/**
 * Endpoint Webhook Resmi Midtrans.
 * Dipanggil oleh server Midtrans secara asinkron saat status transaksi berubah (QRIS/VA dibayar).
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    custom_field1: userId,
    custom_field2: plan,
  } = body;

  console.log(`[Midtrans Webhook] Received notification for Order: ${order_id}, Status: ${transaction_status}`);

  // 1. Verifikasi Keaslian Tanda Tangan Webhook dari Midtrans
  const isValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
  if (!isValid) {
    console.error(`[Midtrans Webhook] INVALID SIGNATURE for Order ${order_id}`);
    return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
  }

  // 2. Cek Apakah Pembayaran Berhasil (Settlement / Capture Accept)
  const isPaid =
    transaction_status === 'settlement' ||
    (transaction_status === 'capture' && fraud_status === 'accept');

  if (isPaid && userId && plan) {
    try {
      console.log(`[Midtrans Webhook] Activating subscription for User ${userId} with Plan ${plan}`);
      await activateSubscription(userId, plan as PaidPlan);
      return NextResponse.json({ status: 'SUCCESS', message: 'Subscription activated' });
    } catch (err: any) {
      console.error(`[Midtrans Webhook] Error activating subscription:`, err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Handle pembatalan / kedaluwarsa
  if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
    console.log(`[Midtrans Webhook] Order ${order_id} failed/expired/canceled`);
  }

  return NextResponse.json({ status: 'OK' });
}
