import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { executeScheduledPost } from '@/server/social/publisher';

export const runtime = 'nodejs';

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
      include: { socialAccount: true },
    });

    return NextResponse.json({
      success: result.success,
      result,
      post: updatedPost,
      message: result.success
        ? 'Postingan berhasil dipublikasikan sekarang!'
        : (result.error || 'Gagal mempublikasikan postingan.'),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mempublikasikan postingan.' },
      { status: 500 }
    );
  }
}
