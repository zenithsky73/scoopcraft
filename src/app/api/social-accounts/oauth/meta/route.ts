import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';

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
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings', baseUrl));
  }

  const appId = process.env.META_APP_ID;
  if (!appId) {
    return NextResponse.redirect(
      new URL('/settings?tab=social&error=meta_app_not_configured', baseUrl)
    );
  }

  const { searchParams } = new URL(req.url);
  const targetPlatform = (searchParams.get('platform') || 'INSTAGRAM').toUpperCase();

  const redirectUri = `${baseUrl}/api/social-accounts/oauth/meta/callback`;

  // State parameter to prevent CSRF and identify user & target platform
  const statePayload = {
    userId: viewer.user.id,
    targetPlatform,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  // Scopes tailored to platform
  let scopes = [
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_metadata',
    'instagram_basic',
    'instagram_content_publish',
  ];

  if (targetPlatform === 'FACEBOOK') {
    scopes = [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
    ];
  }

  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes.join(','));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl.toString());

  // Store state in a secure cookie for validation
  response.cookies.set('meta_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return response;
}
