import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getReplizAccounts } from '@/server/social/repliz-client';
import type { SocialPlatform } from '@prisma/client';

export const runtime = 'nodejs';

function mapPlatform(p: string): SocialPlatform | null {
  const norm = p.toUpperCase();
  if (norm === 'INSTAGRAM') return 'INSTAGRAM';
  if (norm === 'TIKTOK') return 'TIKTOK';
  if (norm === 'THREADS') return 'THREADS';
  if (norm === 'FACEBOOK') return 'FACEBOOK';
  if (norm === 'LINKEDIN') return 'LINKEDIN';
  return null;
}

/**
 * GET /api/social-accounts/sync
 * Ambil daftar akun dari Repliz Master pool dan cek status klaim multi-tenant
 */
export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const [replizData, dbAccounts] = await Promise.all([
      getReplizAccounts(1, 100),
      db.socialAccount.findMany({
        select: {
          id: true,
          userId: true,
          platform: true,
          externalId: true,
          accountHandle: true,
          accountName: true,
        },
      }),
    ]);

    const mappedAccounts = replizData.docs.map((acc) => {
      const platformEnum = mapPlatform(acc.platform) || ('INSTAGRAM' as SocialPlatform);
      const cleanHandle = acc.username.startsWith('@') ? acc.username : `@${acc.username}`;
      
      const claimedRecord = dbAccounts.find(
        (dba) => dba.externalId === acc._id || (dba.platform === platformEnum && dba.accountHandle?.toLowerCase() === cleanHandle.toLowerCase())
      );

      const isClaimedByCurrentUser = claimedRecord?.userId === viewer.user.id;
      const isClaimedByOther = Boolean(claimedRecord && claimedRecord.userId !== viewer.user.id);
      const isAvailable = !isClaimedByOther;

      return {
        id: acc._id,
        replizId: acc._id,
        platform: platformEnum,
        name: acc.name || acc.username,
        username: cleanHandle,
        avatar: acc.avatar || null,
        status: acc.status,
        isClaimedByCurrentUser,
        isClaimedByOther,
        isAvailable,
      };
    });

    return NextResponse.json({
      success: true,
      totalInPool: replizData.total,
      accounts: mappedAccounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal sinkronisasi data Repliz.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-accounts/sync
 * Klaim / Tautkan akun dari Repliz ke user InstaDeck
 */
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { replizAccountId, platform, accountName, accountHandle, avatarUrl } = body;

    if (!replizAccountId || !platform) {
      return NextResponse.json({ error: 'Data akun tidak lengkap.' }, { status: 400 });
    }

    const platformEnum = mapPlatform(platform) || ('INSTAGRAM' as SocialPlatform);
    let cleanHandle = (accountHandle || accountName || '').trim();
    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    // Cek apakah akun ini sudah diklaim user lain
    const existing = await db.socialAccount.findFirst({
      where: {
        externalId: replizAccountId,
        NOT: { userId: viewer.user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Akun ini sudah diklaim oleh pengguna lain di InstaDeck.' },
        { status: 409 }
      );
    }

    const account = await db.socialAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId: viewer.user.id,
          platform: platformEnum,
          externalId: replizAccountId,
        },
      },
      update: {
        accountName: (accountName || cleanHandle.replace('@', '')).trim(),
        accountHandle: cleanHandle,
        avatarUrl: avatarUrl || null,
        isConnected: true,
        metadata: {
          replizAccountId,
          replizLinked: true,
          platform: platformEnum,
          syncedAt: new Date().toISOString(),
        },
      },
      create: {
        userId: viewer.user.id,
        platform: platformEnum,
        accountName: (accountName || cleanHandle.replace('@', '')).trim(),
        accountHandle: cleanHandle,
        avatarUrl: avatarUrl || null,
        externalId: replizAccountId,
        isConnected: true,
        metadata: {
          replizAccountId,
          replizLinked: true,
          platform: platformEnum,
          syncedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal menautkan akun.' },
      { status: 500 }
    );
  }
}
