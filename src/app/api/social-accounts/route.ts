import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import type { SocialPlatform } from '@prisma/client';

export const runtime = 'nodejs';

const connectSchema = z.object({
  platform: z.enum(['INSTAGRAM', 'TIKTOK', 'THREADS', 'LINKEDIN', 'FACEBOOK', 'PINTEREST', 'TELEGRAM']),
  accountName: z.string().min(1, 'Nama akun wajib diisi'),
  accountHandle: z.string().min(1, 'Username/handle wajib diisi'),
  avatarUrl: z.string().optional(),
  accessToken: z.string().optional(),
  externalId: z.string().optional(),
  isDemo: z.boolean().default(false),
});

export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const accounts = await db.socialAccount.findMany({
      where: { userId: viewer.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mengambil data akun media sosial.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = connectSchema.parse(body);

    let cleanHandle = validated.accountHandle.trim();
    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    const token = validated.isDemo
      ? 'demo_token'
      : validated.accessToken || 'repliz_gold_token';

    const uniqueExternalId = validated.externalId?.trim() || `repliz_${validated.platform.toLowerCase()}_${cleanHandle.replace('@', '')}_${viewer.user.id.substring(0, 6)}`;

    const account = await db.socialAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId: viewer.user.id,
          platform: validated.platform as SocialPlatform,
          externalId: uniqueExternalId,
        },
      },
      update: {
        accountName: validated.accountName.trim(),
        accountHandle: cleanHandle,
        avatarUrl: validated.avatarUrl || null,
        accessToken: token,
        isConnected: true,
        metadata: {
          replizLinked: true,
          handle: cleanHandle,
          platform: validated.platform,
          connectedAt: new Date().toISOString(),
        },
      },
      create: {
        userId: viewer.user.id,
        platform: validated.platform as SocialPlatform,
        accountName: validated.accountName.trim(),
        accountHandle: cleanHandle,
        avatarUrl: validated.avatarUrl || null,
        accessToken: token,
        externalId: uniqueExternalId,
        isConnected: true,
        metadata: {
          replizLinked: true,
          handle: cleanHandle,
          platform: validated.platform,
          connectedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues?.[0]?.message || 'Input tidak valid' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || 'Gagal menghubungkan akun.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('id');

  if (!accountId) {
    return NextResponse.json({ error: 'ID akun diperlukan.' }, { status: 400 });
  }

  try {
    await db.socialAccount.deleteMany({
      where: {
        id: accountId,
        userId: viewer.user.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Akun berhasil dilepas.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal melepas akun.' },
      { status: 500 }
    );
  }
}
