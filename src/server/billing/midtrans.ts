import { createHash } from 'node:crypto';
import type { PaidPlan } from '@/config/plans';
import { PLANS } from '@/config/plans';

/**
 * Midtrans Payment Gateway Integration untuk Newsly AI.
 * Mendukung Snap Popup, QRIS (BCA, GoPay, OVO, ShopeePay, Dana),
 * dan Virtual Account Bank Indonesia.
 */

export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true';
}

export function getMidtransServerKey(): string {
  return process.env.MIDTRANS_SERVER_KEY || '';
}

export function getMidtransClientKey(): string {
  return process.env.MIDTRANS_CLIENT_KEY || '';
}

export function getMidtransSnapUrl(): string {
  return isMidtransProduction()
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

export function getMidtransApiBaseUrl(): string {
  return isMidtransProduction()
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1';
}

export type CreateSnapTransactionInput = {
  orderId: string;
  plan: PaidPlan;
  userId: string;
  userEmail: string;
  userName?: string | null;
};

export type SnapTransactionResponse = {
  token: string;
  redirect_url: string;
};

/**
 * Membuat transaksi Snap di Midtrans.
 */
export async function createMidtransSnapTransaction(
  input: CreateSnapTransactionInput,
): Promise<SnapTransactionResponse> {
  const serverKey = getMidtransServerKey();
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum diatur di .env');
  }

  const planDef = PLANS[input.plan];
  if (!planDef) {
    throw new Error(`Paket ${input.plan} tidak valid.`);
  }

  const payload = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: planDef.price,
    },
    item_details: [
      {
        id: input.plan,
        price: planDef.price,
        quantity: 1,
        name: `Newsly AI - ${planDef.name}`,
      },
    ],
    customer_details: {
      email: input.userEmail,
      first_name: input.userName || input.userEmail.split('@')[0],
    },
    custom_field1: input.userId,
    custom_field2: input.plan,
  };

  const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
  const response = await fetch(`${getMidtransApiBaseUrl()}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Gagal membuat transaksi Midtrans.');
  }

  return data as SnapTransactionResponse;
}

/**
 * Memvalidasi signature hash dari Webhook Notification Midtrans.
 * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  const serverKey = getMidtransServerKey();
  if (!serverKey) return false;

  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const expectedHash = createHash('sha512').update(raw).digest('hex');

  return expectedHash.toLowerCase() === signatureKey.toLowerCase();
}
