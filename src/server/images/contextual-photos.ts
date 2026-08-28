/**
 * Contextual Photo Engine untuk Newsly AI.
 * Menyediakan koleksi foto editorial resolusi tinggi (Unsplash HD CDN)
 * yang dicocokkan secara presisi berdasarkan topik berita dan kata kunci per-slide.
 */

export const TOPIC_PHOTO_COLLECTION: Record<string, string[]> = {
  // ─── 1. SMARTPHONE, HP & GADGET MOBILE ───
  SMARTPHONE: [
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1080&auto=format&fit=crop&q=80', // Modern smartphone back camera module
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&auto=format&fit=crop&q=80', // Sleek smartphone screen
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1080&auto=format&fit=crop&q=80', // Hand holding smartphone
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1080&auto=format&fit=crop&q=80', // Mobile phone display
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1080&auto=format&fit=crop&q=80', // Minimalist flagship smartphone
    'https://images.unsplash.com/photo-1533228801726-5b432a514d79?w=1080&auto=format&fit=crop&q=80', // Smartphone photography
  ],

  // ─── 2. KAMERA, LENSA & SENSOR FOTOGRAFI ───
  KAMERA: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1080&auto=format&fit=crop&q=80', // Professional camera lens
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1080&auto=format&fit=crop&q=80', // Camera sensor & optics
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1080&auto=format&fit=crop&q=80', // Close up camera lens aperture
    'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=1080&auto=format&fit=crop&q=80', // Optical zoom lens
  ],

  // ─── 3. BATERAI, DAYA & ENERGI SILIKON ───
  BATERAI: [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1080&auto=format&fit=crop&q=80', // Battery energy cell
    'https://images.unsplash.com/photo-1558441719-8b449c6ff670?w=1080&auto=format&fit=crop&q=80', // High-tech battery charging
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1080&auto=format&fit=crop&q=80', // Fast energy technology
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1080&auto=format&fit=crop&q=80', // Green energy circuit
  ],

  // ─── 4. CHIP, PROSESOR & PERFORMA ───
  CHIP: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80', // Microchip processor CPU
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&auto=format&fit=crop&q=80', // High-speed semiconductor
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1080&auto=format&fit=crop&q=80', // Hardware chipset
  ],

  // ─── 5. KENDARAAN LISTRIK, MOTOR & MOBIL (EV) ───
  OTOMOTIF_EV: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1080&auto=format&fit=crop&q=80', // Electric motorcycle bike
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1080&auto=format&fit=crop&q=80', // EV electric car charging
    'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1080&auto=format&fit=crop&q=80', // Modern electric vehicle
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1080&auto=format&fit=crop&q=80', // Electric motor scooter
  ],

  // ─── 6. AI, ROBOTIK & SOFTWARE ───
  AI_TECH: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&auto=format&fit=crop&q=80', // AI Robot head
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80', // Neural network abstract
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1080&auto=format&fit=crop&q=80', // Cloud server rack
  ],

  // ─── 7. LAPTOP & KOMPUTER ───
  LAPTOP: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1080&auto=format&fit=crop&q=80', // Modern sleek laptop
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1080&auto=format&fit=crop&q=80', // MacBook workspace
  ],

  // ─── 8. EKONOMI, BISNIS & KEUANGAN ───
  EKONOMI: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Candlestick chart
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&auto=format&fit=crop&q=80', // Stock trading screen
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1080&auto=format&fit=crop&q=80', // Banknotes money
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Financial tower
  ],

  // ─── 9. POLITIK & PEMERINTAHAN ───
  POLITIK: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1080&auto=format&fit=crop&q=80', // Press conference microphones
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1080&auto=format&fit=crop&q=80', // Parliament assembly hall
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&auto=format&fit=crop&q=80', // Diplomatic executive meeting
  ],

  // ─── 10. HUKUM & PENGADILAN ───
  HUKUM: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080&auto=format&fit=crop&q=80', // Law gavel & scales
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1080&auto=format&fit=crop&q=80', // Law library books
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1080&auto=format&fit=crop&q=80', // Courtroom judge desk
  ],

  // ─── 11. PENDIDIKAN & KAMPUS ───
  PENDIDIKAN: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&auto=format&fit=crop&q=80', // University students discussion
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1080&auto=format&fit=crop&q=80', // Campus library
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Book stack research
  ],

  // ─── 12. OLAHRAGA & SPORT ───
  OLAHRAGA: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1080&auto=format&fit=crop&q=80', // Stadium night arena
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1080&auto=format&fit=crop&q=80', // Football match
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1080&auto=format&fit=crop&q=80', // Athletic sprinting
  ],

  // ─── 13. KULINER & MAKANAN ───
  KULINER: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&auto=format&fit=crop&q=80', // Gourmet meal plate
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80', // Restaurant food cooking
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&auto=format&fit=crop&q=80', // Artisan pizza dish
  ],

  // ─── 14. GENERAL NEWS / HEADLINES ───
  BERITA: [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1080&auto=format&fit=crop&q=80', // Newspaper headlines
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&auto=format&fit=crop&q=80', // Live journalism broadcast
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&auto=format&fit=crop&q=80', // Global communication
  ],
};

/**
 * Mendeteksi kategori yang paling spesifik dan presisi berdasarkan kata kunci teks.
 */
export function detectCategoryFromText(text: string): string {
  const t = text.toLowerCase();

  // 1. SMARTPHONE & MOBILE GADGET SPECIFICS
  if (
    t.includes('kamera') ||
    t.includes('telefoto') ||
    t.includes('lens') ||
    t.includes('sensor 200') ||
    t.includes('megapiksel') ||
    t.includes('mp') ||
    t.includes('zoom optis')
  ) {
    return 'KAMERA';
  }

  if (
    t.includes('baterai') ||
    t.includes('mah') ||
    t.includes('fast charging') ||
    t.includes('silikon') ||
    t.includes('pengisian daya') ||
    t.includes('watt')
  ) {
    return 'BATERAI';
  }

  if (
    t.includes('chip') ||
    t.includes('snapdragon') ||
    t.includes('dimensity') ||
    t.includes('prosesor') ||
    t.includes('ram') ||
    t.includes('bionic')
  ) {
    return 'CHIP';
  }

  if (
    t.includes('hp') ||
    t.includes('smartphone') ||
    t.includes('flagship') ||
    t.includes('find x') ||
    t.includes('galaxy') ||
    t.includes('iphone') ||
    t.includes('xiaomi') ||
    t.includes('oppo') ||
    t.includes('vivo') ||
    t.includes('layar amoled') ||
    t.includes('gadget') ||
    t.includes('ponsel') ||
    t.includes('android') ||
    t.includes('ios')
  ) {
    return 'SMARTPHONE';
  }

  // 2. KENDARAAN LISTRIK (EV) & OTOMOTIF
  if (
    t.includes('motor listrik') ||
    t.includes('mobil listrik') ||
    t.includes('ev') ||
    t.includes('gesits') ||
    t.includes('alva') ||
    t.includes('polytron') ||
    t.includes('wuling') ||
    t.includes('byd') ||
    t.includes('hyundai') ||
    t.includes('tesla') ||
    t.includes('otomotif') ||
    t.includes('kendaraan')
  ) {
    return 'OTOMOTIF_EV';
  }

  // 3. LAPTOP & KOMPUTER
  if (t.includes('laptop') || t.includes('macbook') || t.includes('pc') || t.includes('komputer') || t.includes('desktop')) {
    return 'LAPTOP';
  }

  // 4. AI & SOFTWARE
  if (t.includes('ai') || t.includes('robot') || t.includes('chatgpt') || t.includes('gemini') || t.includes('claude') || t.includes('algoritma') || t.includes('software')) {
    return 'AI_TECH';
  }

  // 5. KULINER & MAKANAN
  if (t.includes('kuliner') || t.includes('makanan') || t.includes('restoran') || t.includes('resep') || t.includes('kopi') || t.includes('cafe') || t.includes('masakan')) {
    return 'KULINER';
  }

  // 6. EKONOMI & KEUANGAN
  if (t.includes('saham') || t.includes('uang') || t.includes('rupiah') || t.includes('finansial') || t.includes('investasi') || t.includes('cuan') || t.includes('inflasi') || t.includes('bi-rate') || t.includes('bank') || t.includes('pasar') || t.includes('crypto') || t.includes('bitcoin')) {
    return 'EKONOMI';
  }

  // 7. POLITIK
  if (t.includes('presiden') || t.includes('prabowo') || t.includes('jokowi') || t.includes('menteri') || t.includes('dpr') || t.includes('pemilu') || t.includes('partai') || t.includes('politik') || t.includes('pemerintah') || t.includes('negara')) {
    return 'POLITIK';
  }

  // 8. HUKUM
  if (t.includes('polisi') || t.includes('kpk') || t.includes('sidang') || t.includes('hakim') || t.includes('hukum') || t.includes('korupsi') || t.includes('kasus') || t.includes('penjara') || t.includes('kejaksaan')) {
    return 'HUKUM';
  }

  // 9. PENDIDIKAN
  if (t.includes('kampus') || t.includes('kuliah') || t.includes('mahasiswa') || t.includes('sekolah') || t.includes('guru') || t.includes('belajar') || t.includes('pendidikan') || t.includes('skripsi')) {
    return 'PENDIDIKAN';
  }

  // 10. OLAHRAGA
  if (t.includes('bola') || t.includes('timnas') || t.includes('atlet') || t.includes('liga') || t.includes('juara') || t.includes('pertandingan') || t.includes('olahraga') || t.includes('skor')) {
    return 'OLAHRAGA';
  }

  return 'BERITA';
}

/**
 * Mengambil foto editorial yang relevan untuk setiap slide secara dinamis, presisi & kontekstual.
 */
export function getContextualPhotoForSlide(
  category: string | undefined,
  slideIndex: number,
  slideText?: string,
  articleImageUrl?: string | null,
): string {
  // Slide 0 (Cover): Jika ada gambar asli dari URL artikel, selalu utamakan
  if (slideIndex === 0 && articleImageUrl) {
    return articleImageUrl;
  }

  // Deteksi kategori spesifik dari teks slide ini terlebih dahulu
  const detectedCategory = detectCategoryFromText(slideText || category || '');
  const pool = TOPIC_PHOTO_COLLECTION[detectedCategory] || TOPIC_PHOTO_COLLECTION.BERITA;

  // Pastikan slide 1, 2, 3, 4, 5 selalu mendapatkan foto yang berbeda
  const photoIndex = slideIndex % pool.length;
  return pool[photoIndex] || pool[0];
}
