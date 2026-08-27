export type ScrapeErrorCode =
  | 'INVALID_URL'
  | 'BLOCKED_HOST'
  | 'FETCH_FAILED'
  | 'TIMEOUT'
  | 'NOT_HTML'
  | 'TOO_LARGE'
  | 'PAYWALL'
  | 'NOT_ARTICLE'
  | 'TOO_SHORT'
  | 'BROWSER_UNAVAILABLE';

const MESSAGES: Record<ScrapeErrorCode, string> = {
  INVALID_URL: 'URL tidak valid. Pastikan diawali http:// atau https://.',
  BLOCKED_HOST: 'Alamat ini tidak boleh diakses.',
  FETCH_FAILED: 'Gagal mengambil halaman. Situs mungkin sedang down atau memblokir akses.',
  TIMEOUT: 'Halaman terlalu lama merespons.',
  NOT_HTML: 'URL ini bukan halaman web (HTML).',
  TOO_LARGE: 'Halaman terlalu besar untuk diproses.',
  PAYWALL: 'Artikel terkunci paywall atau butuh login.',
  NOT_ARTICLE: 'Tidak ditemukan artikel di halaman ini. Coba URL artikelnya langsung, bukan halaman indeks.',
  TOO_SHORT: 'Isi artikel terlalu pendek untuk dijadikan konten.',
  BROWSER_UNAVAILABLE: 'Halaman butuh render browser, tapi Chromium belum terpasang di server.',
};

const STATUS: Record<ScrapeErrorCode, number> = {
  INVALID_URL: 400,
  BLOCKED_HOST: 400,
  FETCH_FAILED: 502,
  TIMEOUT: 504,
  NOT_HTML: 415,
  TOO_LARGE: 413,
  PAYWALL: 422,
  NOT_ARTICLE: 422,
  TOO_SHORT: 422,
  BROWSER_UNAVAILABLE: 503,
};

export class ScrapeError extends Error {
  readonly code: ScrapeErrorCode;
  readonly status: number;
  /** Detail teknis untuk log — jangan dikirim ke klien. */
  readonly detail?: string;

  constructor(code: ScrapeErrorCode, detail?: string) {
    super(MESSAGES[code]);
    this.name = 'ScrapeError';
    this.code = code;
    this.status = STATUS[code];
    this.detail = detail;
  }
}

export function isScrapeError(err: unknown): err is ScrapeError {
  return err instanceof ScrapeError;
}
