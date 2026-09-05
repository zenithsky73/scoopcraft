import confetti from 'canvas-confetti';

/**
 * Memicu efek partikel selebrasi spektakuler saat berhasil membuat / mengekspor konten.
 * Menggabungkan multi-stage fireworks dari kiri-kanan dan ledakan partikel berkilau di tengah layar.
 */
export function triggerCelebrationParticles() {
  if (typeof window === 'undefined') return;

  const count = 180;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    try {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    } catch (e) {
      console.warn('[Confetti Particle]:', e);
    }
  }

  // Stage 1: Percikan awal neon cyan & electric blue
  fire(0.25, {
    spread: 30,
    startVelocity: 55,
    colors: ['#06B6D4', '#3B82F6', '#8B5CF6'],
  });

  // Stage 2: Ledakan magenta & sunset coral (Warna Brand Newsly)
  fire(0.2, {
    spread: 60,
    colors: ['#EC4899', '#F43F5E', '#F59E0B'],
  });

  // Stage 3: Taburan partikel halus melebar
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#10B981', '#06B6D4', '#6366F1', '#FACC15'],
  });

  // Stage 4: Bintang-bintang besar emas berkilau
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#FACC15', '#F59E0B', '#EF4444'],
  });

  // Stage 5: Fireworks pelangi penutup
  setTimeout(() => {
    fire(0.15, {
      spread: 130,
      startVelocity: 45,
      origin: { y: 0.55 },
      colors: ['#8B5CF6', '#EC4899', '#38BDF8', '#10B981'],
    });
  }, 250);
}
