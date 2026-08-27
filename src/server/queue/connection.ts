import IORedis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: IORedis };

export function getRedis() {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      // Wajib null untuk BullMQ: worker memakai blocking command yang
      // tidak boleh dibatalkan oleh retry-per-request milik ioredis.
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Tanpa handler, kegagalan koneksi keluar sebagai AggregateError mentah
    // yang membingungkan. Cukup satu pesan jelas, sisanya ditelan.
    let warned = false;
    globalForRedis.redis.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNREFUSED') {
        if (!warned) {
          warned = true;
          console.error(
            `[redis] tidak bisa terhubung ke ${process.env.REDIS_URL ?? 'redis://localhost:6379'}. ` +
              'Jalankan `docker compose up -d`, atau set QUEUE_DRIVER=inline untuk dev tanpa Redis.',
          );
        }
        return;
      }
      console.error('[redis]', err.message);
    });
  }
  return globalForRedis.redis;
}

export async function closeRedis() {
  await globalForRedis.redis?.quit().catch(() => {});
  globalForRedis.redis = undefined;
}
