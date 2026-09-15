import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { revokeApiKey } from '@/server/auth/api-key';

export const runtime = 'nodejs';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID API Key tidak valid.' }, { status: 400 });
    }

    await revokeApiKey(id, viewer.user.id);

    return NextResponse.json({
      success: true,
      message: 'API Key berhasil dihapus.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Gagal menghapus API Key.' }, { status: 500 });
  }
}
