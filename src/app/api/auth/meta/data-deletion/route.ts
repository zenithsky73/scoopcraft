import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const confirmationCode = 'del_' + Math.random().toString(36).substring(2, 12);
    const trackingUrl = 'https://scoopcraft.vercel.app/data-deletion?code=' + confirmationCode;

    return NextResponse.json({
      url: trackingUrl,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.redirect(new URL('/data-deletion', 'https://scoopcraft.vercel.app'));
}
