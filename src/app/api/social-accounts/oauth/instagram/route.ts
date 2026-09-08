import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';

export const runtime = 'nodejs';

function getBaseUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.AUTH_URL && !process.env.AUTH_URL.includes('localhost')) return process.env.AUTH_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
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
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings', baseUrl));
  }

  const igAppId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID;
  if (!igAppId) {
    return NextResponse.redirect(new URL('/settings?tab=social&error=instagram_app_not_configured', baseUrl));
  }

  const redirectUri = `${baseUrl}/api/social-accounts/oauth/instagram/callback`;
  const statePayload = {
    userId: viewer.user.id,
    targetPlatform: 'INSTAGRAM',
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  const authUrl = new URL('https://api.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', igAppId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_content_publish');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
