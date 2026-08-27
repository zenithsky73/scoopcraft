/** Uji cepat penyusunan deck carousel. */
import { buildDeck } from '../src/server/design/deck';

const slides = [1, 2, 3, 4].map((i) => ({ title: `Poin ${i}`, body: `Isi ${i}` }));
const base = { headline: 'H', feedCopy: 'F', cta: 'C' };

for (const n of [1, 2, 3, 5, 7, 9]) {
  const deck = buildDeck({ ...base, slides }, n);
  console.log(`minta ${String(n).padStart(2)} → ${deck.length} slide: ${deck.map((s) => s.type).join(' ')}`);
}

const few = buildDeck({ ...base, slides: slides.slice(0, 1) }, 5);
console.log(`poin cuma 1, minta 5 → ${few.length} slide: ${few.map((s) => s.type).join(' ')}`);

const none = buildDeck({ ...base, slides: [] }, 5);
console.log(`tanpa poin, minta 5  → ${none.length} slide: ${none.map((s) => s.type).join(' ')}`);
