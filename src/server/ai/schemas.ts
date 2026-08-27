import { z } from 'zod';

/**
 * Catatan penting soal structured outputs:
 * konverter zod → JSON Schema di SDK menurunkan setiap constraint yang tidak
 * didukung (enum, minItems, maxLength) menjadi teks di field `description`,
 * mis. `{"type":"string","description":"{enum: [\"NEUTRAL\",...]}"}`.
 *
 * Artinya API menjamin BENTUK dan TIPE, bukan NILAI. Constraint di bawah ini
 * berguna sebagai petunjuk tambahan untuk model, tetapi hasilnya tetap:
 *  - divalidasi ulang oleh zod saat parsing (nilai di luar enum → INVALID_OUTPUT),
 *  - dipagari panjangnya di validate.ts sebelum masuk ke render.
 */

export const ENTITY_TYPES = ['PERSON', 'ORG', 'PLACE', 'EVENT', 'OTHER'] as const;
export const TONES = ['NEUTRAL', 'URGENT', 'INSPIRING', 'ANALYTICAL', 'CAUTIONARY'] as const;
export const SENSITIVITY = ['NONE', 'LOW', 'HIGH'] as const;
export const CATEGORIES = [
  'POLITIK', 'EKONOMI', 'HUKUM', 'OLAHRAGA', 'TEKNOLOGI',
  'HIBURAN', 'KESEHATAN', 'PENDIDIKAN', 'LINGKUNGAN', 'BENCANA', 'INTERNASIONAL', 'LAINNYA',
] as const;

export const analysisSchema = z.object({
  topic: z.string().describe('Topik utama dalam satu kalimat singkat.'),
  category: z.enum(CATEGORIES),
  summary: z.string().describe('Ringkasan 2-3 kalimat.'),
  keyPoints: z.array(z.string()).describe('3-5 poin inti, masing-masing satu kalimat.'),
  facts: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .describe('Angka/fakta konkret dari artikel, mis. { label: "Suku bunga", value: "5,75%" }.'),
  entities: z.array(z.object({ name: z.string(), type: z.enum(ENTITY_TYPES) })).describe('Entitas penting dalam artikel.'),
  angles: z
    .array(z.object({ angle: z.string(), rationale: z.string() }))
    .describe('2-3 alternatif sudut pandang konten.'),
  recommendedAngle: z.string().describe('Salah satu angle di atas, ditulis ulang persis.'),
  tone: z.enum(TONES),
  /**
   * Berita duka, bencana, kriminal, atau isu sensitif tidak boleh diberi
   * copy bergaya hype. Nilai ini mengunci gaya di tahap generate.
   */
  sensitivity: z.enum(SENSITIVITY),
  visualPrompt: z
    .string()
    .describe('Deskripsi gambar editorial dalam bahasa Inggris, dipakai kalau gambar artikel tidak layak.'),
});

export type Analysis = z.infer<typeof analysisSchema>;

/** Satu slide isi carousel. */
export const slideCopySchema = z.object({
  title: z.string().describe('Judul slide, maksimal 48 karakter.'),
  body: z.string().describe('Penjelasan 1-2 kalimat, maksimal 150 karakter.'),
  visualPrompt: z
    .string()
    .describe(
      'Deskripsi gambar untuk slide ini dalam Bahasa Inggris — memvisualisasikan poin di slide ini, bukan berita secara umum.',
    ),
});

export type SlideCopy = z.infer<typeof slideCopySchema>;

export const contentSchema = z.object({
  headline: z.string().describe('Headline untuk di dalam gambar, maksimal 70 karakter.'),
  feedCopy: z.string().describe('Teks pendukung di dalam gambar, maksimal 180 karakter.'),
  caption: z.string().describe('Caption media sosial, 300-600 karakter, boleh pakai baris baru.'),
  hashtags: z.array(z.string()).describe('6-10 hashtag tanpa tanda pagar.'),
  cta: z.string().describe('Ajakan singkat, maksimal 60 karakter.'),
  angle: z.string().describe('Sudut pandang yang dipakai.'),
  altText: z.string().describe('Alt text aksesibilitas untuk gambar, maksimal 125 karakter.'),
  slides: z
    .array(slideCopySchema)
    .describe('3-5 poin penting berita, masing-masing jadi satu slide carousel.'),
});

export type GeneratedCopy = z.infer<typeof contentSchema>;
