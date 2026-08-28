/**
 * Contextual Photo Engine untuk Newsly AI.
 * Menyediakan koleksi foto editorial resolusi tinggi (Unsplash HD CDN)
 * yang dicocokkan secara cerdas berdasarkan kata kunci teks slide, topik berita,
 * dan kategori jurnalisme Indonesia.
 */

export const TOPIC_PHOTO_COLLECTION: Record<string, string[]> = {
  // ─── 1. EKONOMI, BISNIS & KEUANGAN ───
  EKONOMI: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Stock candlestick chart
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&auto=format&fit=crop&q=80', // Trading screen board
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1080&auto=format&fit=crop&q=80', // Money banknotes
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1080&auto=format&fit=crop&q=80', // Calculator finance audit
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Bank skyscraper
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&auto=format&fit=crop&q=80', // Business growth graph
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1080&auto=format&fit=crop&q=80', // Crypto digital assets
  ],

  // ─── 2. POLITIK, PEMERINTAHAN & DIPLOMASI ───
  POLITIK: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1080&auto=format&fit=crop&q=80', // Press conference microphones
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1080&auto=format&fit=crop&q=80', // Parliament assembly hall
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&auto=format&fit=crop&q=80', // Diplomatic executive meeting
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&auto=format&fit=crop&q=80', // City government capital
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1080&auto=format&fit=crop&q=80', // Official podium speech
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1080&auto=format&fit=crop&q=80', // Leadership forum
  ],

  // ─── 3. HUKUM, KRIMINAL & KEADILAN ───
  HUKUM: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080&auto=format&fit=crop&q=80', // Law gavel & scales
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1080&auto=format&fit=crop&q=80', // Law library books
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1080&auto=format&fit=crop&q=80', // Courtroom judge desk
    'https://images.unsplash.com/photo-1453733197783-64ac7d824963?w=1080&auto=format&fit=crop&q=80', // Legal contract signature
  ],

  // ─── 4. TEKNOLOGI, GADGET & AI ───
  TEKNOLOGI: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80', // Tech circuit CPU
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&auto=format&fit=crop&q=80', // AI Robot head
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&auto=format&fit=crop&q=80', // Cybersecurity network
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1080&auto=format&fit=crop&q=80', // Cyber laptop neon
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&auto=format&fit=crop&q=80', // Tech software engineers
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1080&auto=format&fit=crop&q=80', // Data center server rack
  ],

  // ─── 5. PENDIDIKAN, KAMPUS & MAHASISWA ───
  PENDIDIKAN: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&auto=format&fit=crop&q=80', // University students discussion
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1080&auto=format&fit=crop&q=80', // Campus library
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Book stack research
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&auto=format&fit=crop&q=80', // Group workshop teamwork
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&auto=format&fit=crop&q=80', // Digital e-learning
  ],

  // ─── 6. OLAHRAGA, SPORT & ATLET ───
  OLAHRAGA: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1080&auto=format&fit=crop&q=80', // Stadium night arena
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1080&auto=format&fit=crop&q=80', // Football player match
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1080&auto=format&fit=crop&q=80', // Athletic running sprint
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&auto=format&fit=crop&q=80', // Basketball court hoop
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1080&auto=format&fit=crop&q=80', // Fitness strength training
  ],

  // ─── 7. HIBURAN, MUSIK & SELEBRITAS ───
  HIBURAN: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1080&auto=format&fit=crop&q=80', // Concert stage festival
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080&auto=format&fit=crop&q=80', // Cinema film clapperboard
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080&auto=format&fit=crop&q=80', // DJ electronic party
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80', // Studio microphone broadcast
  ],

  // ─── 8. KESEHATAN & MEDIS ───
  KESEHATAN: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1080&auto=format&fit=crop&q=80', // Doctor hospital stethoscope
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1080&auto=format&fit=crop&q=80', // Medical laboratory scientific
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1080&auto=format&fit=crop&q=80', // Hospital patient care
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1080&auto=format&fit=crop&q=80', // Nutrition health wellness
  ],

  // ─── 9. KARIER, KERJA & PRODUKTIVITAS ───
  KARIER: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1080&auto=format&fit=crop&q=80', // Professional handshake
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1080&auto=format&fit=crop&q=80', // Executive corporate team
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1080&auto=format&fit=crop&q=80', // Modern office boardroom
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&auto=format&fit=crop&q=80', // Strategic presentation
  ],

  // ─── 10. BENCANA, LINGKUNGAN & ALAM ───
  BENCANA: [
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1080&auto=format&fit=crop&q=80', // Wildfire smoke / disaster
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1080&auto=format&fit=crop&q=80', // Storm rain clouds
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1080&auto=format&fit=crop&q=80', // Emergency rescue vehicle
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&auto=format&fit=crop&q=80', // Nature landscape misty
  ],

  // ─── 11. GENERAL NEWS / HEADLINES ───
  BERITA: [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1080&auto=format&fit=crop&q=80', // Newspaper headlines
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&auto=format&fit=crop&q=80', // Live journalism broadcast
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Metropolis skyline
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&auto=format&fit=crop&q=80', // Global communication
  ],
};

/**
 * Mendeteksi kategori yang paling presisi berdasarkan teks judul / topik / isi slide.
 */
export function detectCategoryFromText(text: string): string {
  const t = text.toLowerCase();

  if (t.includes('saham') || t.includes('uang') || t.includes('rupiah') || t.includes('finansial') || t.includes('investasi') || t.includes('cuan') || t.includes('inflasi') || t.includes('bi-rate') || t.includes('bank') || t.includes('pasar')) {
    return 'EKONOMI';
  }
  if (t.includes('presiden') || t.includes('prabowo') || t.includes('jokowi') || t.includes('menteri') || t.includes('dpr') || t.includes('pemilu') || t.includes('partai') || t.includes('politik') || t.includes('pemerintah') || t.includes('negara')) {
    return 'POLITIK';
  }
  if (t.includes('polisi') || t.includes('kpk') || t.includes('sidang') || t.includes('hakim') || t.includes('hukum') || t.includes('korupsi') || t.includes('kasus') || t.includes('penjara') || t.includes('kejaksaan')) {
    return 'HUKUM';
  }
  if (t.includes('ai') || t.includes('teknologi') || t.includes('robot') || t.includes('chip') || t.includes('software') || t.includes('gadget') || t.includes('apple') || t.includes('google') || t.includes('aplikasi') || t.includes('cyber')) {
    return 'TEKNOLOGI';
  }
  if (t.includes('kampus') || t.includes('kuliah') || t.includes('mahasiswa') || t.includes('sekolah') || t.includes('guru') || t.includes('belajar') || t.includes('pendidikan') || t.includes('skripsi')) {
    return 'PENDIDIKAN';
  }
  if (t.includes('bola') || t.includes('timnas') || t.includes('atlet') || t.includes('liga') || t.includes('juara') || t.includes('pertandingan') || t.includes('olahraga') || t.includes('skor')) {
    return 'OLAHRAGA';
  }
  if (t.includes('film') || t.includes('lagu') || t.includes('artis') || t.includes('konser') || t.includes('aktor') || t.includes('hiburan') || t.includes('selebriti') || t.includes('bioskop')) {
    return 'HIBURAN';
  }
  if (t.includes('dokter') || t.includes('rumah sakit') || t.includes('kesehatan') || t.includes('obat') || t.includes('penyakit') || t.includes('virus') || t.includes('gizi')) {
    return 'KESEHATAN';
  }
  if (t.includes('gempa') || t.includes('banjir') || t.includes('longsor') || t.includes('bencana') || t.includes('cuaca') || t.includes('gunung') || t.includes('kebakaran') || t.includes('hutan')) {
    return 'BENCANA';
  }
  if (t.includes('karir') || t.includes('kerja') || t.includes('gaji') || t.includes('kantor') || t.includes('wawancara') || t.includes('bisnis') || t.includes('perusahaan') || t.includes('bos')) {
    return 'KARIER';
  }

  return 'BERITA';
}

/**
 * Mengambil foto editorial yang relevan untuk setiap slide secara dinamis & bervariasi.
 */
export function getContextualPhotoForSlide(
  category: string | undefined,
  slideIndex: number,
  title?: string,
  articleImageUrl?: string | null,
): string {
  // Slide 0 (Cover): Jika ada gambar asli dari URL artikel, selalu utamakan
  if (slideIndex === 0 && articleImageUrl) {
    return articleImageUrl;
  }

  // Deteksi kategori dari teks slide dan judul artikel
  const detectedCategory = detectCategoryFromText(`${category || ''} ${title || ''}`);
  const pool = TOPIC_PHOTO_COLLECTION[detectedCategory] || TOPIC_PHOTO_COLLECTION.BERITA;

  // Pastikan slide 1, 2, 3, 4, 5 selalu mendapatkan foto yang berbeda
  const photoIndex = slideIndex % pool.length;
  return pool[photoIndex] || pool[0];
}
