import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { connectReplizOAuthAccount } from '@/server/social/repliz-client';
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
    if (!code) {
      return NextResponse.redirect(
        new URL(
          `/calendar?canceled=oauth&error=${encodeURIComponent(
            `Login atau otorisasi ${platformCookie} dibatalkan. Silakan login ke akun Anda dan izinkan akses.`
          )}`,
          baseUrl
        )
      );
    }

    // Exchange code with Repliz
    const exchangeResult = await connectReplizOAuthAccount(platformCookie, code);
    if (!exchangeResult.success || !exchangeResult.account) {
      return NextResponse.redirect(
        new URL(
          `/calendar?error=${encodeURIComponent(
            exchangeResult.error || `Gagal menautkan akun ${platformCookie} resmi.`
          )}`,
          baseUrl
        )
      );
    }

    const accountDetails = exchangeResult.account;
    const connectedAccountId =
      accountDetails._id || accountDetails.id || accountDetails.accountId;

    if (!connectedAccountId) {
      return NextResponse.redirect(
        new URL(
          `/calendar?error=${encodeURIComponent(
            `Data akun ${platformCookie} tidak valid dari provider resmi.`
          )}`,
          baseUrl
        )
      );
    }

    let handle =
      accountDetails.username || accountDetails.name || 'Akun';
    if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }
    const name = accountDetails.name || handle.replace('@', '');
    const avatar = accountDetails.avatar || null;

    // Upsert into Prisma SocialAccount for this user
    await db.socialAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId,
          platform: platformEnum,
          externalId: connectedAccountId,
        },
      },
      update: {
        accountName: name,
        accountHandle: handle,
        avatarUrl: avatar,
        isConnected: true,
        accessToken: 'repliz_gold_oauth_token',
        metadata: {
          replizAccountId: connectedAccountId,
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
        externalId: connectedAccountId,
        isConnected: true,
        accessToken: 'repliz_gold_oauth_token',
        metadata: {
          replizAccountId: connectedAccountId,
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
