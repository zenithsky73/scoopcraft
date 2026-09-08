import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';

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
  const baseUrl = getBaseUrl(req);
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?tab=social&canceled=threads', baseUrl));
  }

  const viewer = await getViewer();
  let targetUserId = viewer?.user?.id;

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (!targetUserId && decoded?.userId) targetUserId = decoded.userId;
    } catch (e) {}
  }

  if (!targetUserId) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings', baseUrl));
  }

  const appId = process.env.THREADS_APP_ID || '1639563870930153';
  const appSecret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET;

  if (!appSecret) {
    return NextResponse.redirect(new URL('/settings?tab=social&error=threads_secret_missing', baseUrl));
  }

  const redirectUri = `${baseUrl}/api/social-accounts/oauth/threads/callback`;

  try {
    const form = new URLSearchParams();
    form.set('client_id', appId);
    form.set('client_secret', appSecret);
    form.set('grant_type', 'authorization_code');
    form.set('redirect_uri', redirectUri);
    form.set('code', code.replace(/#_$/, ''));

    const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      body: form,
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Threads Token Exchange Error]:', tokenData);
      return NextResponse.redirect(new URL('/settings?tab=social&error=threads_token_failed', baseUrl));
    }

    let userAccessToken = tokenData.access_token;
    const thUserId = tokenData.user_id;

    // Long lived token
    try {
      const llRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${userAccessToken}`);
      const llData = await llRes.json();
      if (llData.access_token) userAccessToken = llData.access_token;
    } catch (e) {}

    // Get user info
    let username = 'threads_user';
    let profilePic: string | null = null;
    try {
      const meRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${userAccessToken}`);
      const meData = await meRes.json();
      if (meData.username) username = meData.username;
      if (meData.threads_profile_picture_url) profilePic = meData.threads_profile_picture_url;
    } catch (e) {}

    const handle = username.startsWith('@') ? username : `@${username}`;

    await db.socialAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId: targetUserId,
          platform: 'THREADS',
          externalId: thUserId.toString(),
        },
      },
      update: {
        accountName: username,
        accountHandle: handle,
        avatarUrl: profilePic,
        accessToken: userAccessToken,
        isConnected: true,
        metadata: { thUserId },
      },
      create: {
        userId: targetUserId,
        platform: 'THREADS',
        accountName: username,
        accountHandle: handle,
        avatarUrl: profilePic,
        externalId: thUserId.toString(),
        accessToken: userAccessToken,
        isConnected: true,
        metadata: { thUserId },
      },
    });

    return NextResponse.redirect(new URL('/settings?tab=social&connected=threads', baseUrl));
  } catch (err: any) {
    console.error('[Threads OAuth Error]:', err);
    return NextResponse.redirect(new URL(`/settings?tab=social&error=${encodeURIComponent(err.message || 'threads_auth_failed')}`, baseUrl));
  }
}
