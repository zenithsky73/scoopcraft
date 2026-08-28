/**
 * Modul resolusi gambar kontekstual berita & media sosial Indonesia.
 * Menyediakan koleksi foto editorial resolusi tinggi (Unsplash CDN) yang dikurasi
 * berdasarkan kategori, kata kunci topik, dan nomor slide agar tiap slide
 * mendapatkan gambar yang relevan dan bervariasi.
 */

export const CATEGORY_PHOTOS: Record<string, string[]> = {
  EKONOMI: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Stock chart / market
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1080&auto=format&fit=crop&q=80', // Money / currency
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&auto=format&fit=crop&q=80', // Financial analysis chart
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Modern skyscraper / bank building
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&auto=format&fit=crop&q=80', // Stock market trading board
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1080&auto=format&fit=crop&q=80', // Business calculator & audit
  ],
  POLITIK: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1080&auto=format&fit=crop&q=80', // Press conference / microphones
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1080&auto=format&fit=crop&q=80', // Parliament / assembly hall
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080&auto=format&fit=crop&q=80', // Legal gavel / law justice
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&auto=format&fit=crop&q=80', // City government skyline
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&auto=format&fit=crop&q=80', // Diplomatic meeting
  ],
  TEKNOLOGI: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80', // Circuit board / tech chip
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&auto=format&fit=crop&q=80', // AI Robotic head
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&auto=format&fit=crop&q=80', // Cybersecurity matrix
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&auto=format&fit=crop&q=80', // Modern tech workspace / coding
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1080&auto=format&fit=crop&q=80', // Laptop cyber glow
  ],
  PENDIDIKAN: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&auto=format&fit=crop&q=80', // Students studying together
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1080&auto=format&fit=crop&q=80', // University campus library
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&auto=format&fit=crop&q=80', // Group workshop discussion
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Stack of books / knowledge
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&auto=format&fit=crop&q=80', // Online learning laptop
  ],
  OLAHRAGA: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1080&auto=format&fit=crop&q=80', // Football stadium lights
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1080&auto=format&fit=crop&q=80', // Athletic running sprint
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1080&auto=format&fit=crop&q=80', // Football player kicking ball
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&auto=format&fit=crop&q=80', // Basketball hoop arena
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1080&auto=format&fit=crop&q=80', // Fitness training energy
  ],
  HIBURAN: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1080&auto=format&fit=crop&q=80', // Concert stage / lights
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080&auto=format&fit=crop&q=80', // Cinema movie production
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080&auto=format&fit=crop&q=80', // Music DJ party
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80', // Studio microphone / music
  ],
  KESEHATAN: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1080&auto=format&fit=crop&q=80', // Doctor / medical stethoscope
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1080&auto=format&fit=crop&q=80', // Healthcare hospital care
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1080&auto=format&fit=crop&q=80', // Clinical laboratory research
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1080&auto=format&fit=crop&q=80', // Healthy nutrition food
  ],
  KARIER: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1080&auto=format&fit=crop&q=80', // Job interview handshake
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1080&auto=format&fit=crop&q=80', // Professional office teamwork
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1080&auto=format&fit=crop&q=80', // Modern corporate office
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&auto=format&fit=crop&q=80', // Professional executive presentation
  ],
  DEFAULT: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&auto=format&fit=crop&q=80', // News / newspaper press
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1080&auto=format&fit=crop&q=80', // Breaking news papers
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&auto=format&fit=crop&q=80', // Global technology network
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&auto=format&fit=crop&q=80', // Nature / landscape
  ],
};

/**
 * Mengambil foto editorial yang relevan untuk setiap slide berdasarkan kategori dan indeks slide.
 */
export function getContextualPhotoForSlide(
  category: string | undefined,
  slideIndex: number,
  title?: string,
  articleImageUrl?: string | null,
): string {
  // Slide 0 (Cover): Utamakan gambar asli artikel jika ada
  if (slideIndex === 0 && articleImageUrl) {
    return articleImageUrl;
  }

  const catUpper = (category || '').toUpperCase().trim();
  const pool =
    CATEGORY_PHOTOS[catUpper] ||
    (title?.toLowerCase().includes('saham') || title?.toLowerCase().includes('uang') || title?.toLowerCase().includes('bunga')
      ? CATEGORY_PHOTOS.EKONOMI
      : title?.toLowerCase().includes('ai') || title?.toLowerCase().includes('tech')
      ? CATEGORY_PHOTOS.TEKNOLOGI
      : title?.toLowerCase().includes('kampus') || title?.toLowerCase().includes('kuliah')
      ? CATEGORY_PHOTOS.PENDIDIKAN
      : title?.toLowerCase().includes('karir') || title?.toLowerCase().includes('kerja')
      ? CATEGORY_PHOTOS.KARIER
      : CATEGORY_PHOTOS.DEFAULT);

  // Ambil gambar secara deterministik per nomor slide agar slide 1, 2, 3, 4, 5 selalu berbeda
  const photoIndex = slideIndex % pool.length;
  return pool[photoIndex] || pool[0];
}
