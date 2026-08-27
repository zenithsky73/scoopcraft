import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Halaman /render/[assetId] dibuka oleh Chromium headless yang tidak punya
 * sesi login, tapi isinya milik user. Token HMAC berumur pendek dipakai
 * sebagai gantinya — jangan dibuat publik tanpa token.
 */
const TTL_MS = 5 * 60_000;
const FALLBACK_SECRET = 'rqdK59PJ5WWq/TvzTlFbgENX6EV/iLKkhK2YXa7pLYI=';

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || FALLBACK_SECRET;
}

export function signRenderToken(assetId: string, expiresAt = Date.now() + TTL_MS) {
  const payload = `${assetId}.${expiresAt}`;
  const signature = createHmac('sha256', secret()).update(payload).digest('hex');
  return `${expiresAt}.${signature}`;
}

export function verifyRenderToken(assetId: string, token: string | undefined | null) {
  if (!token) return false;

  const [expiresRaw, signature] = token.split('.');
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() || !signature) return false;

  const expected = createHmac('sha256', secret()).update(`${assetId}.${expiresAt}`).digest('hex');
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
