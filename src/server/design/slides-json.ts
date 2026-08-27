import type { Prisma } from '@prisma/client';
import { slideCopySchema, type SlideCopy } from '@/server/ai/schemas';
import { z } from 'zod';

const arraySchema = z.array(slideCopySchema);

/**
 * Naskah slide disimpan sebagai Json di GeneratedContent. Kolom Json tidak
 * punya jaminan bentuk, jadi selalu divalidasi saat dibaca — data lama
 * (sebelum fitur carousel) mengembalikan array kosong, bukan error.
 */
export function slidesFromJson(value: Prisma.JsonValue | null | undefined): SlideCopy[] {
  if (!value) return [];
  const parsed = arraySchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}
