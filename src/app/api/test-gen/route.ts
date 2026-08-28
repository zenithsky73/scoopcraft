import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { generateDirect } from '@/server/ai/direct-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: Record<string, any> = {};

  // Step 1: Find or create a test user
  try {
    let user = await db.user.findFirst({ where: { isGuest: true } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: `test-guest-${Date.now()}@scoopcraft.test`,
          isGuest: true,
          plan: 'TRIAL',
        },
      });
    }
    steps.user = { id: user.id, email: user.email };
  } catch (err: any) {
    steps.userError = err.message || String(err);
    return NextResponse.json({ error: 'Step 1 User DB failed', steps }, { status: 500 });
  }

  // Step 2: Run generateDirect
  try {
    const result = await generateDirect({
      userId: steps.user.id,
      mode: 'prompt',
      prompt: '3 tips investasi reksadana untuk pemula',
      tone: 'Informatif',
      style: 'BREAKING_NEWS',
      format: 'FEED_PORTRAIT',
      slides: 3,
    });
    steps.generateDirectResult = {
      runId: result.runId,
      headline: result.content.headline,
      slidesCount: result.content.slides.length,
    };
  } catch (err: any) {
    steps.generateDirectError = err.message || String(err);
    return NextResponse.json({ error: 'Step 2 generateDirect failed', steps }, { status: 500 });
  }

  return NextResponse.json({ status: 'SUCCESS', steps });
}
