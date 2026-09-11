import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { connectReplizOAuthAccount, getReplizAccounts } from '@/server/social/repliz-client';
import type { SocialPlatform } from '@prisma/client';

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

function mapPlatform(p: string): SocialPlatform {
  const norm = p.toUpperCase();
  if (norm === 'TIKTOK') return 'TIKTOK';
  if (norm === 'THREADS') return 'THREADS';
  if (norm === 'FACEBOOK') return 'FACEBOOK';
  if (norm === 'LINKEDIN') return 'LINKEDIN';
  return 'INSTAGRAM';
}

export async function GET(req: Request) {
  const viewer = await getViewer();
  const baseUrl = getBaseUrl(req);
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const error = searchParams.get('error') || searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(new URL(`/calendar?canceled=oauth&error=${encodeURIComponent(error)}`, baseUrl));
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const platformCookie = cookieHeader
    .split(';')
    .find((c) => c.trim().startsWith('repliz_oauth_platform='))
    ?.split('=')[1]?.trim() || 'instagram';

  const userId = viewer?.user?.id;
  if (!userId) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/calendar', baseUrl));
  }

  const platformEnum = mapPlatform(platformCookie);

  try {
    let connectedAccountId = '';
    let accountDetails: any = null;

    if (code) {
      // Exchange code with Repliz
      const exchangeResult = await connectReplizOAuthAccount(platformCookie, code);
      if (exchangeResult.success && exchangeResult.account) {
        connectedAccountId = exchangeResult.account._id || exchangeResult.account.id || exchangeResult.account.accountId || '';
        accountDetails = exchangeResult.account;
      }
    }

    // Refresh list from Repliz pool to find the newest account
    const replizData = await getReplizAccounts(1, 20);
    const newestAccount = connectedAccountId
      ? replizData.docs.find((d) => d._id === connectedAccountId)
      : replizData.docs.find((d) => d.platform?.toLowerCase() === platformCookie.toLowerCase()) || replizData.docs[0];

    const finalExternalId = connectedAccountId || newestAccount?._id || `repliz_${platformCookie}_${Date.now()}`;
    let handle = newestAccount?.username || newestAccount?.name || accountDetails?.username || accountDetails?.name || 'Akun Baru';
    if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }
    const name = newestAccount?.name || accountDetails?.name || handle.replace('@', '');
    const avatar = newestAccount?.avatar || accountDetails?.avatar || null;

    // Upsert into Prisma SocialAccount for this user
    await db.socialAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId,
          platform: platformEnum,
          externalId: finalExternalId,
        },
      },
      update: {
        accountName: name,
        accountHandle: handle,
        avatarUrl: avatar,
        isConnected: true,
        accessToken: 'repliz_gold_oauth_token',
        metadata: {
          replizAccountId: finalExternalId,
          platform: platformEnum,
          connectedVia: 'repliz_oauth_direct',
          connectedAt: new Date().toISOString(),
        },
      },
      create: {
        userId,
        platform: platformEnum,
        accountName: name,
        accountHandle: handle,
        avatarUrl: avatar,
        externalId: finalExternalId,
        isConnected: true,
        accessToken: 'repliz_gold_oauth_token',
        metadata: {
          replizAccountId: finalExternalId,
          platform: platformEnum,
          connectedVia: 'repliz_oauth_direct',
          connectedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.redirect(
      new URL(`/calendar?connected=${platformCookie.toLowerCase()}&handle=${encodeURIComponent(handle)}`, baseUrl)
    );
  } catch (err: any) {
    console.error('[Repliz OAuth Callback Error]:', err);
    return NextResponse.redirect(
      new URL(`/calendar?error=${encodeURIComponent(err?.message || 'Gagal menyelesaikan otorisasi')}`, baseUrl)
    );
  }
}
