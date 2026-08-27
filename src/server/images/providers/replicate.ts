import { ImageProviderError, type GenerateImageInput, type GeneratedImage, type ImageProvider } from '@/server/images/provider';

/**
 * Adapter Replicate. Contoh implementasi vendor sungguhan — belum diuji
 * dengan kredensial nyata. Model dipilih lewat REPLICATE_MODEL supaya
 * pindah model tidak perlu ubah kode.
 */
export class ReplicateProvider implements ImageProvider {
  readonly name = 'replicate';

  private get token() {
    return process.env.REPLICATE_API_TOKEN ?? '';
  }

  isAvailable() {
    return this.token.length > 0;
  }

  async generate({ prompt, width, height, seed }: GenerateImageInput): Promise<GeneratedImage> {
    if (!this.isAvailable()) {
      throw new ImageProviderError(this.name, 'REPLICATE_API_TOKEN belum diatur.', false);
    }

    const model = process.env.REPLICATE_MODEL ?? 'black-forest-labs/flux-schnell';

    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.token}`,
        'content-type': 'application/json',
        // Menunggu hasil dalam satu request; tanpa ini harus polling.
        prefer: 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: aspectRatio(width, height),
          output_format: 'png',
          seed: seedToInt(seed),
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new ImageProviderError(this.name, `HTTP ${res.status}: ${body.slice(0, 200)}`, res.status >= 500 || res.status === 429);
    }

    const json = (await res.json()) as { output?: string | string[]; error?: string };
    if (json.error) throw new ImageProviderError(this.name, json.error);

    const url = Array.isArray(json.output) ? json.output[0] : json.output;
    if (!url) throw new ImageProviderError(this.name, 'Respons tidak memuat URL gambar.');

    const image = await fetch(url);
    if (!image.ok) throw new ImageProviderError(this.name, `Gagal mengunduh hasil: HTTP ${image.status}`);

    return {
      buffer: Buffer.from(await image.arrayBuffer()),
      contentType: image.headers.get('content-type') ?? 'image/png',
      provider: this.name,
    };
  }
}

function aspectRatio(width: number, height: number) {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return '1:1';
  if (Math.abs(ratio - 0.8) < 0.05) return '4:5';
  if (Math.abs(ratio - 0.5625) < 0.05) return '9:16';
  return '1:1';
}

function seedToInt(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash);
}
