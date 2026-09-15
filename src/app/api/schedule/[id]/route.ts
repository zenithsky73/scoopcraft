import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { executeScheduledPost } from '@/server/social/publisher';

export const runtime = 'nodejs';

// POST: Trigger publikasi sekarang juga (Publish Now)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const post = await db.scheduledPost.findFirst({
    where: {
      id: params.id,
      userId: viewer.user.id,
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Postingan tidak ditemukan.' }, { status: 404 });
  }

  try {
    const result = await executeScheduledPost(post.id);
    const updatedPost = await db.scheduledPost.findUnique({
      where: { id: post.id },
    });

    return NextResponse.json({
      success: result.success,
      result,
      post: updatedPost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mempublikasikan postingan.' },
      { status: 500 }
    );
  }
}

// DELETE: Batalkan / hapus postingan terjadwal
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const post = await db.scheduledPost.findFirst({
      where: {
        id: params.id,
        userId: viewer.user.id,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan.' }, { status: 404 });
    }

    await db.scheduledPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Jadwal postingan berhasil dibatalkan dan dihapus.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal menghapus postingan terjadwal.' },
      { status: 500 }
    );
  }
}

// PATCH: Postingan terjadwal bersifat paten dan tidak dapat diubah
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Postingan yang sudah terjadwal bersifat paten dan tidak dapat diubah lagi.' },
    { status: 403 }
  );
}
