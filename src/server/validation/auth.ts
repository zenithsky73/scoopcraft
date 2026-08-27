import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(60).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
