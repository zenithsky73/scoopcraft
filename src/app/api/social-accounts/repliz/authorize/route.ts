import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { getReplizOAuthUrl } from '@/server/social/repliz-client';

export const runtime = 'nodejs';

function getBaseUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.AUTH_URL && !process.env.AUTH_URL.includes('localhost')) {
    return process.env.AUTH_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return 'http://localhost:3000';
}

export async function GET(req: Request) {
  const viewer = await getViewer();
  const baseUrl = getBaseUrl(req);

  if (!viewer?.user) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/calendar', baseUrl));
  }

  const { searchParams } = new URL(req.url);
  const platform = (searchParams.get('platform') || 'instagram').toLowerCase();

  try {
    const callbackUrl = `${baseUrl}/api/social-accounts/repliz/callback`;
    const oauthUrl = await getReplizOAuthUrl(platform, callbackUrl);

    const response = NextResponse.redirect(oauthUrl);

    // Save platform and user id in cookie for callback verification
    response.cookies.set('repliz_oauth_platform', platform, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    response.cookies.set('repliz_oauth_user_id', viewer.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    });

    return response;
  } catch (error: any) {
    console.error('[Repliz OAuth Authorize Error]:', error);
    return NextResponse.redirect(
      new URL(`/calendar?error=${encodeURIComponent(error?.message || 'Gagal memulai otorisasi')}`, baseUrl)
    );
  }
}
