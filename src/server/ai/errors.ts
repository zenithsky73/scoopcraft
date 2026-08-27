export type AiErrorCode =
  | 'NO_API_KEY'
  | 'AUTH'
  | 'RATE_LIMITED'
  | 'REFUSED'
  | 'INVALID_OUTPUT'
  | 'OVERLOADED'
  | 'UNKNOWN';

const MESSAGES: Record<AiErrorCode, string> = {
  NO_API_KEY: 'Kredensial Anthropic belum diatur di server.',
  AUTH: 'Kredensial Anthropic ditolak.',
  RATE_LIMITED: 'Batas pemakaian AI tercapai. Coba lagi sebentar lagi.',
  REFUSED: 'AI menolak memproses artikel ini karena kebijakan konten.',
  INVALID_OUTPUT: 'AI mengembalikan keluaran yang tidak sesuai format.',
  OVERLOADED: 'Layanan AI sedang sibuk.',
  UNKNOWN: 'Gagal memproses dengan AI.',
};

export class AiError extends Error {
  readonly code: AiErrorCode;
  /** Layak dicoba ulang oleh queue? */
  readonly retryable: boolean;
  readonly detail?: string;

  constructor(code: AiErrorCode, detail?: string) {
    super(MESSAGES[code]);
    this.name = 'AiError';
    this.code = code;
    this.detail = detail;
    this.retryable = code === 'RATE_LIMITED' || code === 'OVERLOADED' || code === 'INVALID_OUTPUT';
  }
}

export function isAiError(err: unknown): err is AiError {
  return err instanceof AiError;
}
