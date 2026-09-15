import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/server/viewer';
import { createApiKey, listApiKeys } from '@/server/auth/api-key';

export const runtime = 'nodejs';

const createKeySchema = z.object({
  name: z.string().max(50).optional(),
});

export async function GET() {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const keys = await listApiKeys(viewer.user.id);
    return NextResponse.json({ keys });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Gagal memuat API Keys.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = createKeySchema.safeParse(body);
    const name = parsed.success && parsed.data.name ? parsed.data.name : 'Claude Desktop Key';

    const newKey = await createApiKey(viewer.user.id, name);

    return NextResponse.json({
      success: true,
      key: newKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Gagal membuat API Key baru.' }, { status: 500 });
  }
}
