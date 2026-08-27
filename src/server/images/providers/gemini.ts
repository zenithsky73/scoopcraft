import {
  ImageProviderError,
  type GenerateImageInput,
  type GeneratedImage,
  type ImageProvider,
} from '@/server/images/provider';

/**
 * Google Gemini image generation lewat endpoint /v1beta/interactions.
 *
 * Model dan ukuran diatur lewat env supaya ganti model tidak perlu ubah kode:
 *   GEMINI_IMAGE_MODEL  gemini-3.1-flash-image (default) | gemini-3-pro-image |
 *                       gemini-3.1-flash-lite-image | gemini-2.5-flash-image
 *   GEMINI_IMAGE_SIZE   1K (default) | 2K | 4K   (lite hanya mendukung 1K)
 */
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** Rasio yang didukung Gemini, dipetakan dari format kanvas kita. */
const ASPECT_RATIOS: [ratio: number, label: string][] = [
  [1, '1:1'],
  [4 / 5, '4:5'],
  [3 / 4, '3:4'],
  [2 / 3, '2:3'],
  [9 / 16, '9:16'],
  [3 / 2, '3:2'],
  [4 / 3, '4:3'],
  [16 / 9, '16:9'],
];

function aspectRatio(width: number, height: number) {
  const target = width / height;
  return ASPECT_RATIOS.reduce((best, current) =>
    Math.abs(current[0] - target) < Math.abs(best[0] - target) ? current : best,
  )[1];
}

type ImageBlock = { data: string; mime: string };

/**
 * Bentuk respons endpoint ini tidak didokumentasikan lengkap, jadi blok
 * gambarnya dicari di beberapa jalur yang wajar sekaligus: properti pintasan
 * `output_image`, lalu penelusuran rekursif untuk objek pertama yang punya
 * data base64 bertipe gambar. Lebih tahan banting daripada menebak satu jalur.
 */
function findImage(payload: unknown): ImageBlock | null {
  const seen = new Set<unknown>();

  const walk = (node: unknown): ImageBlock | null => {
    if (!node || typeof node !== 'object' || seen.has(node)) return null;
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item);
        if (found) return found;
      }
      return null;
    }

    const obj = node as Record<string, unknown>;
    const data = obj.data ?? obj.b64_json ?? obj.bytesBase64Encoded;
    const mime = (obj.mime_type ?? obj.mimeType ?? '') as string;

    if (typeof data === 'string' && data.length > 256 && (!mime || mime.startsWith('image/'))) {
      return { data, mime: mime || 'image/png' };
    }

    // output_image didahulukan karena itu blok terakhir yang dihasilkan.
    for (const key of ['output_image', 'outputImage', ...Object.keys(obj)]) {
      if (!(key in obj)) continue;
      const found = walk(obj[key]);
      if (found) return found;
    }

    return null;
  };

  return walk(payload);
}

export class GeminiImageProvider implements ImageProvider {
  readonly name = 'gemini';

  private get token() {
    return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
  }

  isAvailable() {
    return this.token.length > 0;
  }

  async generate({ prompt, width, height }: GenerateImageInput): Promise<GeneratedImage> {
    if (!this.isAvailable()) {
      throw new ImageProviderError(this.name, 'GEMINI_API_KEY belum diatur.', false);
    }

    const model = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3.1-flash-image';
    const size = process.env.GEMINI_IMAGE_SIZE ?? '1K';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(process.env.IMAGE_TIMEOUT_MS ?? 90_000));

    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'x-goog-api-key': this.token,
          'content-type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          input: [{ type: 'text', text: prompt }],
          response_format: {
            type: 'image',
            // Endpoint ini hanya menerima image/jpeg; PNG ditolak 400.
            mime_type: 'image/jpeg',
            aspect_ratio: aspectRatio(width, height),
            image_size: size,
          },
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ImageProviderError(this.name, `Gagal menghubungi Gemini: ${message}`);
    } finally {
      clearTimeout(timer);
    }

    const raw = await res.text();

    if (!res.ok) {
      // 400 biasanya prompt ditolak filter — mengulangnya tidak menolong.
      const retryable = res.status === 429 || res.status >= 500;
      throw new ImageProviderError(this.name, `HTTP ${res.status}: ${raw.slice(0, 300)}`, retryable);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new ImageProviderError(this.name, 'Respons Gemini bukan JSON yang valid.');
    }

    const image = findImage(payload);
    if (!image) {
      // Kalau tidak ada gambar, biasanya permintaannya ditolak — sertakan
      // cuplikan respons supaya alasannya terlihat di log.
      throw new ImageProviderError(this.name, `Respons tidak memuat gambar: ${raw.slice(0, 300)}`, false);
    }

    return {
      buffer: Buffer.from(image.data, 'base64'),
      contentType: image.mime || 'image/jpeg',
      provider: `${this.name}:${model}`,
    };
  }
}
