import { NextResponse } from 'next/server';
import { generateDirect } from '@/server/ai/direct-generator';
import { getViewer, getOrCreateGuest } from '@/server/viewer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    let user: any = null;
    try {
      const viewer = await getViewer();
      user = viewer?.user;
    } catch {}

    if (!user) {
      try {
        const guest = await getOrCreateGuest();
        user = guest.user;
      } catch {
        user = { id: `guest_${Date.now()}` };
      }
    }

    const result = await generateDirect({
      userId: user?.id || `user_${Date.now()}`,
      mode: body.mode || (body.url ? 'url' : body.rawText ? 'text' : 'prompt'),
      url: body.url,
      rawText: body.rawText || body.text,
      rawTitle: body.rawTitle || body.title,
      prompt: body.prompt,
      tone: body.tone,
      style: body.style || 'BREAKING_NEWS',
      format: body.format || 'FEED_PORTRAIT',
      slides: body.slides || 5,
    });

    return NextResponse.json({
      success: true,
      runId: result.runId,
      status: 'COMPLETED',
      article: result.article,
      content: result.content,
      style: result.style,
      format: result.format,
    });
  } catch (err: any) {
    console.error('generate-magic error:', err);
    return NextResponse.json(
      {
        error: err?.message || 'Gagal membuat carousel',
        detail: String(err),
      },
      { status: 500 },
    );
  }
}
