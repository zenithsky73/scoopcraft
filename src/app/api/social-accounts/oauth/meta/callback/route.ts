import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';

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
  const baseUrl = getBaseUrl(req);
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Jika user membatalkan di dialog Meta
  if (error) {
    console.warn('[Meta OAuth Canceled or Denied]:', error, errorDescription);
    return NextResponse.redirect(
      new URL('/settings?tab=social&canceled=meta', baseUrl)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?tab=social&error=missing_code', baseUrl)
    );
  }

  // Verifikasi viewer atau userId dari state
  const viewer = await getViewer();
  let targetUserId = viewer?.user?.id;
  let targetPlatform = 'INSTAGRAM';

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (!targetUserId && decoded?.userId) {
        targetUserId = decoded.userId;
      }
      if (decoded?.targetPlatform) {
        targetPlatform = decoded.targetPlatform;
      }
    } catch (e) {
      console.warn('[Meta OAuth State Decode Warning]:', e);
    }
  }

  if (!targetUserId) {
    return NextResponse.redirect(
      new URL('/login?callbackUrl=/settings', baseUrl)
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('[Meta OAuth Error]: META_APP_ID or META_APP_SECRET missing');
    return NextResponse.redirect(
      new URL('/settings?tab=social&error=meta_not_configured', baseUrl)
    );
  }

  const redirectUri = `${baseUrl}/api/social-accounts/oauth/meta/callback`;

  try {
    // 1. Tukar authorization code dengan short-lived user access token
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Meta Token Exchange Error]:', tokenData);
      return NextResponse.redirect(
        new URL('/settings?tab=social&error=meta_token_exchange_failed', baseUrl)
      );
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Perpanjang menjadi 60-day Long-Lived User Access Token
    let userToken = shortLivedToken;
    try {
      const longLivedUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
      longLivedUrl.searchParams.set('client_id', appId);
      longLivedUrl.searchParams.set('client_secret', appSecret);
      longLivedUrl.searchParams.set('fb_exchange_token', shortLivedToken);

      const llRes = await fetch(longLivedUrl.toString());
      const llData = await llRes.json();
      if (llData.access_token) {
        userToken = llData.access_token;
      }
    } catch (e) {
      console.warn('[Meta Long-Lived Token Warning]: Gagal perpanjang token, memakai short-lived', e);
    }

    // 3. Ambil daftar Facebook Pages dan Instagram Business Account yang ditautkan
    const accountsUrl = new URL('https://graph.facebook.com/v19.0/me/accounts');
    accountsUrl.searchParams.set(
      'fields',
      'id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url}'
    );
    accountsUrl.searchParams.set('access_token', userToken);

    const accountsRes = await fetch(accountsUrl.toString());
    const accountsData = await accountsRes.json();

    const pages = accountsData?.data || [];
    if (!pages || pages.length === 0) {
      return NextResponse.redirect(
        new URL('/settings?tab=social&warning=no_pages_found', baseUrl)
      );
    }

    let igConnectedCount = 0;
    let fbConnectedCount = 0;

    for (const page of pages) {
      // 3A. Simpan Akun Instagram Profesional jika terhubung ke Fanpage
      if (page.instagram_business_account?.id) {
        const ig = page.instagram_business_account;
        const handle = ig.username ? (ig.username.startsWith('@') ? ig.username : `@${ig.username}`) : `@${page.name}`;
        
        await db.socialAccount.upsert({
          where: {
            userId_platform_externalId: {
              userId: targetUserId,
              platform: 'INSTAGRAM',
              externalId: ig.id,
            },
          },
          update: {
            accountName: ig.name || ig.username || page.name,
            accountHandle: handle,
            avatarUrl: ig.profile_picture_url || null,
            accessToken: page.access_token, // Page Access Token digunakan untuk mempublikasikan konten IG
            isConnected: true,
            metadata: {
              pageId: page.id,
              pageName: page.name,
              igUserId: ig.id,
            },
          },
          create: {
            userId: targetUserId,
            platform: 'INSTAGRAM',
            accountName: ig.name || ig.username || page.name,
            accountHandle: handle,
            avatarUrl: ig.profile_picture_url || null,
            externalId: ig.id,
            accessToken: page.access_token,
            isConnected: true,
            metadata: {
              pageId: page.id,
              pageName: page.name,
              igUserId: ig.id,
            },
          },
        });
        igConnectedCount++;
      }

      // 3B. Simpan Halaman Facebook
      await db.socialAccount.upsert({
        where: {
          userId_platform_externalId: {
            userId: targetUserId,
            platform: 'FACEBOOK',
            externalId: page.id,
          },
        },
        update: {
          accountName: page.name,
          accountHandle: page.name,
          accessToken: page.access_token,
          isConnected: true,
          metadata: { pageId: page.id },
        },
        create: {
          userId: targetUserId,
          platform: 'FACEBOOK',
          accountName: page.name,
          accountHandle: page.name,
          externalId: page.id,
          accessToken: page.access_token,
          isConnected: true,
          metadata: { pageId: page.id },
        },
      });
      fbConnectedCount++;
    }

    const redirectParams = new URLSearchParams({
      tab: 'social',
      connected: 'meta',
      platform: targetPlatform.toLowerCase(),
      ig: igConnectedCount.toString(),
      fb: fbConnectedCount.toString(),
    });

    return NextResponse.redirect(new URL(`/settings?${redirectParams.toString()}`, baseUrl));
  } catch (error: any) {
    console.error('[Meta OAuth Callback Error]:', error);
    return NextResponse.redirect(
      new URL(`/settings?tab=social&error=${encodeURIComponent(error?.message || 'meta_auth_failed')}`, baseUrl)
    );
  }
}
