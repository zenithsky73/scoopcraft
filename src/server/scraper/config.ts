function num(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const SCRAPER = {
  /** Timeout fetch HTML statis. */
  fetchTimeoutMs: num(process.env.SCRAPER_FETCH_TIMEOUT_MS, 12_000),
  /** Timeout total render Playwright (launch + navigate + settle). */
  browserTimeoutMs: num(process.env.SCRAPER_BROWSER_TIMEOUT_MS, 30_000),
  /** Batas ukuran HTML yang diunduh; di atas ini dianggap bukan artikel. */
  maxHtmlBytes: num(process.env.SCRAPER_MAX_HTML_BYTES, 5_000_000),
  /** Di bawah ini hasil statis dianggap gagal → coba Playwright. */
  minWordsStatic: num(process.env.SCRAPER_MIN_WORDS_STATIC, 180),
  /** Di bawah ini hasil akhir ditolak — tidak cukup bahan untuk AI. */
  minWordsAccept: num(process.env.SCRAPER_MIN_WORDS_ACCEPT, 80),
  maxRedirects: 5,
  /** Izinkan fallback browser sama sekali. Set "0" di serverless tanpa Chromium. */
  browserFallbackEnabled: process.env.SCRAPER_BROWSER_FALLBACK !== '0',
  userAgent:
    process.env.SCRAPER_USER_AGENT ??
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Scoopcraft/0.1 (+https://scoopcraft.app/bot)',
} as const;
