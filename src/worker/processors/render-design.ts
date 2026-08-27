import { db } from '@/server/db';
import { renderCanvas } from '@/server/design/renderer';
import { getStorage } from '@/server/storage';
import type { StepContext } from '@/worker/processors/types';

/**
 * Merender satu DesignAsset (satu kombinasi style × format) jadi PNG.
 * Satu job per aset — Feed dan Story berjalan paralel dan gagalnya salah
 * satu tidak menjatuhkan yang lain.
 */
export async function processRenderDesign({ jobId }: StepContext) {
  const job = await db.job.findUniqueOrThrow({ where: { id: jobId } });
  const payload = job.payload as { assetId?: string } | null;
  const assetId = payload?.assetId;

  if (!assetId) throw new Error('Job render tidak menyertakan assetId.');

  const asset = await db.designAsset.update({
    where: { id: assetId },
    data: { status: 'RENDERING', error: null },
  });

  const { buffer, durationMs } = await renderCanvas({
    assetId: asset.id,
    width: asset.width,
    height: asset.height,
  });

  const storage = await getStorage();
  // Versi masuk ke nama berkas supaya render ulang setelah teks diedit tidak
  // tertahan cache browser atau CDN.
  const stored = await storage.put(
    `renders/${asset.id}-v${asset.version}.png`,
    buffer,
    'image/png',
  );

  await db.designAsset.update({
    where: { id: asset.id },
    data: { status: 'READY', imageUrl: stored.url },
  });

  return {
    assetId: asset.id,
    style: asset.style,
    format: asset.format,
    url: stored.url,
    bytes: stored.bytes,
    durationMs,
  };
}
