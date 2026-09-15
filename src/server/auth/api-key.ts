import crypto from 'crypto';
import { db } from '@/server/db';

const API_KEY_PREFIX = 'instadeck_live_';

/**
 * Membuat raw API Key baru dengan format: instadeck_live_<48 hex chars>
 */
export function generateRawApiKey(): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${API_KEY_PREFIX}${randomBytes}`;
}

/**
 * Melakukan SHA-256 hash pada raw API key untuk disimpan secara aman di database.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Menyimpan API key baru ke database untuk user tertentu.
 * Mengembalikan raw key yang HANYA ditampilkan sekali ke pengguna.
 */
export async function createApiKey(userId: string, name: string = 'Default API Key') {
  const rawKey = generateRawApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = `${rawKey.slice(0, 18)}...${rawKey.slice(-4)}`;

  const apiKey = await db.apiKey.create({
    data: {
      userId,
      name: name.trim() || 'Default API Key',
      keyPrefix,
      keyHash,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return {
    ...apiKey,
    rawKey, // Dikembalikan HANYA saat pertama kali dibuat
  };
}

/**
 * Memvalidasi raw API key dari header HTTP (Authorization: Bearer <KEY>).
 * Mengembalikan user terkait jika valid.
 */
export async function validateApiKey(rawKey: string) {
  if (!rawKey || !rawKey.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  const keyHash = hashApiKey(rawKey.trim());

  const apiKey = await db.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        include: {
          brandKit: true,
          socialAccounts: {
            where: { isConnected: true },
          },
        },
      },
    },
  });

  if (!apiKey) {
    return null;
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update lastUsedAt secara asynchronous tanpa memblokir request
  db.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
    },
    user: apiKey.user,
  };
}

/**
 * Mengambil daftar API Key milik seorang user.
 */
export async function listApiKeys(userId: string) {
  return db.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Menghapus / mencabut (revoke) API Key.
 */
export async function revokeApiKey(id: string, userId: string) {
  return db.apiKey.deleteMany({
    where: {
      id,
      userId,
    },
  });
}
