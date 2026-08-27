export type GenerateImageInput = {
  prompt: string;
  width: number;
  height: number;
  /** Kunci determinisme — id konten dipakai agar hasil sama saat render ulang. */
  seed: string;
};

export type GeneratedImage = {
  buffer: Buffer;
  contentType: string;
  provider: string;
};

/**
 * Kontrak penyedia gambar. Semua pemakai hanya bicara ke interface ini,
 * jadi mengganti vendor cukup dengan menambah satu berkas di providers/
 * dan satu baris di getImageProvider().
 */
export interface ImageProvider {
  readonly name: string;
  /** false kalau kredensial atau prasyaratnya belum ada. */
  isAvailable(): boolean;
  generate(input: GenerateImageInput): Promise<GeneratedImage>;
}

export class ImageProviderError extends Error {
  readonly provider: string;
  readonly retryable: boolean;

  constructor(provider: string, message: string, retryable = true) {
    super(message);
    this.name = 'ImageProviderError';
    this.provider = provider;
    this.retryable = retryable;
  }
}

export async function getImageProvider(): Promise<ImageProvider> {
  const name = process.env.IMAGE_PROVIDER ?? 'local';

  switch (name) {
    case 'gemini': {
      const { GeminiImageProvider } = await import('@/server/images/providers/gemini');
      return new GeminiImageProvider();
    }
    case 'replicate': {
      const { ReplicateProvider } = await import('@/server/images/providers/replicate');
      return new ReplicateProvider();
    }
    case 'local':
    default: {
      const { LocalAbstractProvider } = await import('@/server/images/providers/local-abstract');
      return new LocalAbstractProvider();
    }
  }
}
