import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import type { StorageAdapter, StoredFile } from '@/server/storage';

/**
 * Menulis ke public/ supaya Next menyajikannya langsung tanpa route tambahan.
 * Next membaca public/ dari disk saat request, jadi berkas yang ditulis
 * setelah build tetap tersaji (kecuali mode output: 'standalone').
 */
const ROOT = path.join(process.cwd(), 'public', 'generated');

export class LocalStorage implements StorageAdapter {
  readonly name = 'local';

  async put(key: string, data: Buffer, _contentType: string): Promise<StoredFile> {
    const target = path.join(ROOT, key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    return { key, url: `/generated/${key.split(path.sep).join('/')}`, bytes: data.length };
  }

  async remove(key: string) {
    await rm(path.join(ROOT, key), { force: true });
  }
}
