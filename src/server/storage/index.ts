export type StoredFile = { key: string; url: string; bytes: number };

/**
 * Adapter penyimpanan berkas hasil render. Implementasi lokal cukup untuk
 * dev dan VPS satu mesin; ganti dengan S3/R2 tanpa menyentuh pemanggilnya.
 */
export interface StorageAdapter {
  readonly name: string;
  put(key: string, data: Buffer, contentType: string): Promise<StoredFile>;
  remove(key: string): Promise<void>;
}

let cached: StorageAdapter | null = null;

export async function getStorage(): Promise<StorageAdapter> {
  if (cached) return cached;

  // Satu-satunya tempat yang perlu diubah saat menambah provider.
  switch (process.env.STORAGE_DRIVER ?? 'local') {
    case 'local':
    default: {
      const { LocalStorage } = await import('@/server/storage/local');
      cached = new LocalStorage();
      return cached;
    }
  }
}
