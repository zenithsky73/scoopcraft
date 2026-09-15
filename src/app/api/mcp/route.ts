import { NextResponse } from 'next/server';
import { validateApiKey } from '@/server/auth/api-key';
import { generateDirect } from '@/server/ai/direct-generator';
import { STYLES } from '@/config/styles';
import { db } from '@/server/db';
import { DesignStyle, OutputFormat, SocialPlatform } from '@prisma/client';
import { executeScheduledPost } from '@/server/social/publisher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MCP_SERVER_INFO = {
  name: 'instadeck-mcp-server',
  version: '1.0.0',
};

const TOOLS = [
  {
    name: 'instadeck_generate_carousel',
    description:
      'Membuat postingan carousel media sosial multi-slide (3, 5, atau 7 slide) dengan naskah mendalam, pemilihan foto kontekstual, dan template desain visual di InstaDeck.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description:
            'Topik, ide konten, naskah mentah, atau link URL artikel web yang ingin diubah menjadi carousel (contoh: "5 Rahasia Bumbu Rendang Daging Empuk & Gurih", "Panduan Skincare Kulit Berminyak", "https://kompas.com/...").',
        },
        style: {
          type: 'string',
          description:
            'Template visual desain (Pilihan: KULINER_NUSANTARA, NOTION_MINIMAL, JAPANDI_WARM, MATCHA_SAGE, PASTEL_BLUSH, VOGUE_GOLD, MODERN, BREAKING_NEWS, SHOPEE_PROMO, TWITTER_THREAD, MINIMAL, BOLD, TECH, FINANCE, CORPORATE, LIFESTYLE, BRUTALIST_SALE, STEP_BY_STEP_GUIDE, dll). Default: otomatis dipilihkan AI sesuai topik.',
        },
        slidesCount: {
          type: 'number',
          description: 'Jumlah slide carousel (3, 5, atau 7 slide). Default: 5.',
        },
        format: {
          type: 'string',
          enum: ['FEED_PORTRAIT', 'FEED_SQUARE', 'STORY'],
          description: 'Format dimensi output. FEED_PORTRAIT (4:5 rasio feed), FEED_SQUARE (1:1), STORY (9:16). Default: FEED_PORTRAIT.',
        },
        tone: {
          type: 'string',
          description: 'Gaya bahasa / tone naskah (contoh: "Santai & Menghibur", "Edukasi & Praktis", "Storytelling Emosional", "Profesional").',
        },
        brandName: {
          type: 'string',
          description: 'Nama brand atau identitas kreator yang dicetak di header carousel.',
        },
        handle: {
          type: 'string',
          description: 'Username sosial media (contoh: "@resepnusantara.id").',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'instadeck_schedule_post',
    description:
      'Menjadwalkan postingan carousel InstaDeck ke akun media sosial (Instagram, TikTok, Threads, Facebook) pada tanggal dan jam tertentu.',
    inputSchema: {
      type: 'object',
      properties: {
        contentId: {
          type: 'string',
          description: 'ID konten carousel yang dihasilkan dari instadeck_generate_carousel.',
        },
        scheduledAt: {
          type: 'string',
          description:
            'Waktu tayang publikasi dalam format ISO 8601 atau YYYY-MM-DD HH:mm:ss (contoh: "2026-09-16T19:00:00+07:00" atau "2026-09-17 08:00:00").',
        },
        platforms: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['INSTAGRAM', 'TIKTOK', 'THREADS', 'FACEBOOK', 'LINKEDIN'],
          },
          description: 'Platform media sosial tujuan posting. Contoh: ["INSTAGRAM", "THREADS"].',
        },
        caption: {
          type: 'string',
          description: 'Caption khusus untuk postingan. Jika dikosongkan, akan memakai caption otomatis dari carousel.',
        },
      },
      required: ['contentId', 'scheduledAt', 'platforms'],
    },
  },
  {
    name: 'instadeck_list_schedules',
    description: 'Melihat daftar kalender antrean jadwal postingan media sosial di akun InstaDeck pengguna.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PUBLISHED', 'FAILED', 'ALL'],
          description: 'Filter status jadwal postingan. Default: "ALL".',
        },
        limit: {
          type: 'number',
          description: 'Maksimal jumlah jadwal yang ditampilkan (default: 10).',
        },
      },
    },
  },
  {
    name: 'instadeck_cancel_schedule',
    description: 'Membatalkan atau menghapus jadwal postingan di InstaDeck.',
    inputSchema: {
      type: 'object',
      properties: {
        scheduleId: {
          type: 'string',
          description: 'ID jadwal postingan yang ingin dibatalkan.',
        },
      },
      required: ['scheduleId'],
    },
  },
  {
    name: 'instadeck_list_templates',
    description: 'Melihat katalog 38 template visual desain InstaDeck lengkap dengan deskripsi, palet warna, dan kategori.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['ALL', 'MINIMALIST', 'BOLD', 'DARK_MODE', 'EDITORIAL', 'SOCIAL'],
          description: 'Filter kategori template desain visual.',
        },
        isLightOnly: {
          type: 'boolean',
          description: 'Set true untuk hanya menampilkan template bertema terang (Light Mode).',
        },
      },
    },
  },
  {
    name: 'instadeck_get_content',
    description: 'Mengambil detail lengkap naskah dan slide carousel yang sudah dibuat beserta link preview-nya.',
    inputSchema: {
      type: 'object',
      properties: {
        contentId: {
          type: 'string',
          description: 'ID konten carousel.',
        },
      },
      required: ['contentId'],
    },
  },
];

// Helper untuk format JSON-RPC
function jsonRpcResponse(id: string | number | null, result: any) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    result,
  });
}

function jsonRpcError(id: string | number | null, code: number, message: string, data?: any) {
  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id,
      error: { code, message, data },
    },
    { status: code === -32001 ? 401 : 400 }
  );
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  return NextResponse.json({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version,
    description: 'InstaDeck AI Carousel & Social Media Scheduler MCP Server',
    status: 'ACTIVE',
    authenticated: Boolean(token),
    docs: 'https://pro.instadeck.id/settings?tab=integrations',
    toolsCount: TOOLS.length,
  });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // 1. Validasi API Key
  const auth = await validateApiKey(token);
  if (!auth?.user) {
    return jsonRpcError(
      null,
      -32001,
      'Otentikasi Gagal: API Key InstaDeck tidak valid atau belum diisi di header Authorization: Bearer <API_KEY>. Silakan buat API Key di https://pro.instadeck.id/settings.'
    );
  }

  const { user } = auth;

  // 2. Parse JSON-RPC 2.0 Payload
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error: Request body harus berformat JSON valid.');
  }

  const { id = null, method, params } = body;

  try {
    // 3. Handle MCP Methods
    if (method === 'initialize') {
      return jsonRpcResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: MCP_SERVER_INFO,
      });
    }

    if (method === 'notifications/initialized') {
      return new NextResponse(null, { status: 204 });
    }

    if (method === 'tools/list') {
      return jsonRpcResponse(id, {
        tools: TOOLS,
      });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      // ─── TOOL 1: GENERATE CAROUSEL ───
      if (toolName === 'instadeck_generate_carousel') {
        const topic = toolArgs.topic;
        if (!topic) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: 'Error: Parameter "topic" wajib diisi.' }],
          });
        }

        const isUrl = /^https?:\/\//i.test(topic.trim());
        const style: DesignStyle = (toolArgs.style as DesignStyle) || 'CULINARY';
        const format: OutputFormat = (toolArgs.format as OutputFormat) || 'FEED_PORTRAIT';
        const slidesCount = Math.min(Math.max(Number(toolArgs.slidesCount) || 5, 3), 7);

        const result = await generateDirect({
          userId: user.id,
          mode: isUrl ? 'url' : 'prompt',
          url: isUrl ? topic.trim() : undefined,
          prompt: !isUrl ? topic.trim() : undefined,
          style,
          format,
          slides: slidesCount,
          tone: toolArgs.tone,
        });

        const content = result.content;
        const slides = content.slides || [];
        const contentUrl = `https://pro.instadeck.id/result/${content.id}`;

        const summaryMarkdown = `
### 🎉 Carousel InstaDeck Berhasil Dibuat!
- **ID Konten**: \`${content.id}\`
- **Headline Cover**: **${content.headline}**
- **Template Visual**: \`${result.style}\` (${format})
- **Total Slide**: ${slides.length} Slide
- **Link Live Preview & Edit**: [Buka di InstaDeck Studio](${contentUrl})

#### 📑 Struktur Slide:
${slides
  .map(
    (s: any, idx: number) =>
      `* **Slide ${idx + 1} (${s.type || (idx === 0 ? 'COVER' : idx === slides.length - 1 ? 'OUTRO' : 'POINT')})**: ${s.headline || s.title || s.takeaway}\n  ${s.body || s.lead || s.supportingText || ''}`
  )
  .join('\n')}

#### 📝 Caption Rekomendasi:
${content.caption || ''}

${(content.hashtags || []).map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')}
        `.trim();

        return jsonRpcResponse(id, {
          content: [
            {
              type: 'text',
              text: summaryMarkdown,
            },
          ],
        });
      }

      // ─── TOOL 2: SCHEDULE POST ───
      if (toolName === 'instadeck_schedule_post') {
        const { contentId, scheduledAt, platforms = ['INSTAGRAM'], caption } = toolArgs;

        if (!contentId || !scheduledAt) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: 'Error: "contentId" dan "scheduledAt" wajib diisi.' }],
          });
        }

        // Ambil konten yang dibuat
        const content = await db.generatedContent.findUnique({
          where: { id: contentId },
          include: {
            article: { select: { userId: true } },
            visuals: { orderBy: { slideIndex: 'asc' } },
            assets: true,
          },
        });

        if (!content || content.article.userId !== user.id) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: `Error: Konten dengan ID "${contentId}" tidak ditemukan di akun Anda.` }],
          });
        }

        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: `Error: Format waktu "${scheduledAt}" tidak valid.` }],
          });
        }

        // Ambil gambar slide
        const mediaUrls: string[] = [];
        if (content.visuals && content.visuals.length > 0) {
          for (const v of content.visuals) {
            if (v.imageUrl) mediaUrls.push(v.imageUrl);
          }
        }
        if (mediaUrls.length === 0 && content.visualUrl) {
          mediaUrls.push(content.visualUrl);
        }
        if (mediaUrls.length === 0) {
          mediaUrls.push('https://pro.instadeck.id/placeholder.png');
        }

        const firstAsset = content.assets?.[0];
        const postStyle = firstAsset?.style || 'CULINARY';
        const postFormat = firstAsset?.format || 'FEED_PORTRAIT';

        const createdSchedules = [];

        for (const platformStr of platforms) {
          const platform = platformStr as SocialPlatform;
          // Cari akun sosial yang tersambung
          const connectedAccount = user.socialAccounts?.find((a: any) => a.platform === platform);

          const post = await db.scheduledPost.create({
            data: {
              userId: user.id,
              generatedContentId: content.id,
              platform,
              scheduledAt: scheduledDate,
              caption: caption || content.caption || content.headline,
              hashtags: content.hashtags || [],
              mediaUrls,
              format: postFormat,
              style: postStyle,
              socialAccountId: connectedAccount?.id || null,
              status: 'PENDING',
            },
          });

          // Jika jadwal adalah masa lampau / sekarang, langsung eksekusi
          if (scheduledDate <= new Date()) {
            executeScheduledPost(post.id).catch(() => {});
          }

          createdSchedules.push({
            id: post.id,
            platform,
            scheduledAt: scheduledDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            account: connectedAccount ? connectedAccount.accountHandle : 'Akun Default',
          });
        }

        const scheduleSummary = `
### 🗓️ Postingan Berhasil Dijadwalkan di InstaDeck!
- **ID Konten**: \`${content.id}\`
- **Headline**: ${content.headline}
- **Waktu Tayang**: **${scheduledDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB**
- **Platform Tujuan**:
${createdSchedules.map((cs) => `  * **${cs.platform}** (Jadwal ID: \`${cs.id}\` - Akun: ${cs.account})`).join('\n')}

Postingan akan dipublikasikan secara otomatis oleh cloud server InstaDeck pada waktu yang ditentukan. Anda dapat melihat kalender lengkap di [Kalender InstaDeck](https://pro.instadeck.id/schedule).
        `.trim();

        return jsonRpcResponse(id, {
          content: [{ type: 'text', text: scheduleSummary }],
        });
      }

      // ─── TOOL 3: LIST SCHEDULES ───
      if (toolName === 'instadeck_list_schedules') {
        const status = toolArgs.status;
        const limit = Math.min(Number(toolArgs.limit) || 10, 50);

        const where: any = { userId: user.id };
        if (status && status !== 'ALL') {
          where.status = status;
        }

        const posts = await db.scheduledPost.findMany({
          where,
          include: {
            generatedContent: {
              select: { id: true, headline: true },
            },
            socialAccount: {
              select: { platform: true, accountHandle: true },
            },
          },
          orderBy: { scheduledAt: 'asc' },
          take: limit,
        });

        if (posts.length === 0) {
          return jsonRpcResponse(id, {
            content: [{ type: 'text', text: '📅 Saat ini tidak ada antrean jadwal postingan di kalender InstaDeck Anda.' }],
          });
        }

        const listMarkdown = `
### 📅 Daftar Jadwal Postingan InstaDeck (${posts.length} Postingan)
${posts
  .map((p, idx) => {
    const timeStr = p.scheduledAt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const statusIcon = p.status === 'PUBLISHED' ? '✅ SUDAH TAYANG' : p.status === 'FAILED' ? '❌ GAGAL' : '⏳ MENUNGGU TAYANG';
    return `${idx + 1}. **${p.generatedContent?.headline || p.caption.slice(0, 40) + '...'}**
   * **Waktu**: ${timeStr} WIB
   * **Platform**: ${p.platform} (${p.socialAccount?.accountHandle || 'Default'})
   * **Status**: ${statusIcon}
   * **Jadwal ID**: \`${p.id}\``;
  })
  .join('\n\n')}
        `.trim();

        return jsonRpcResponse(id, {
          content: [{ type: 'text', text: listMarkdown }],
        });
      }

      // ─── TOOL 4: CANCEL SCHEDULE ───
      if (toolName === 'instadeck_cancel_schedule') {
        const scheduleId = toolArgs.scheduleId;
        if (!scheduleId) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: 'Error: Parameter "scheduleId" wajib diisi.' }],
          });
        }

        const deleted = await db.scheduledPost.deleteMany({
          where: {
            id: scheduleId,
            userId: user.id,
          },
        });

        if (deleted.count === 0) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: `Error: Jadwal dengan ID "${scheduleId}" tidak ditemukan atau sudah dihapus.` }],
          });
        }

        return jsonRpcResponse(id, {
          content: [{ type: 'text', text: `✅ Jadwal postingan (ID: \`${scheduleId}\`) berhasil dibatalkan dari kalender InstaDeck.` }],
        });
      }

      // ─── TOOL 5: LIST TEMPLATES ───
      if (toolName === 'instadeck_list_templates') {
        const category = toolArgs.category;
        const isLightOnly = Boolean(toolArgs.isLightOnly);

        let filtered = STYLES.filter((s) => s.available);
        if (category && category !== 'ALL') {
          filtered = filtered.filter((s) => s.category === category);
        }
        if (isLightOnly) {
          filtered = filtered.filter((s) => s.isLight);
        }

        const templatesMarkdown = `
### 🎨 Katalog Template Visual InstaDeck (${filtered.length} Template)
${filtered
  .map(
    (t) =>
      `* **\`${t.id}\` — ${t.label}** (${t.isLight ? '☀️ Light Mode' : '🌙 Dark Mode'})
  * *Kategori*: ${t.category} • *Badge*: ${t.badge || '-'}
  * *Warna*: Aksen \`${t.accentColor}\` • Background \`${t.bgColor}\`
  * *Deskripsi*: ${t.description}`
  )
  .join('\n\n')}
        `.trim();

        return jsonRpcResponse(id, {
          content: [{ type: 'text', text: templatesMarkdown }],
        });
      }

      // ─── TOOL 6: GET CONTENT DETAILS ───
      if (toolName === 'instadeck_get_content') {
        const contentId = toolArgs.contentId;
        const content = await db.generatedContent.findUnique({
          where: { id: contentId },
          include: {
            article: { select: { userId: true } },
            visuals: { orderBy: { slideIndex: 'asc' } },
            assets: true,
          },
        });

        if (!content || content.article.userId !== user.id) {
          return jsonRpcResponse(id, {
            isError: true,
            content: [{ type: 'text', text: `Error: Konten "${contentId}" tidak ditemukan.` }],
          });
        }

        const rawSlides = (Array.isArray(content.slides) ? content.slides : []) as any[];
        const firstAsset = content.assets?.[0];
        const contentStyle = firstAsset?.style || 'CULINARY';
        const contentFormat = firstAsset?.format || 'FEED_PORTRAIT';

        const contentMarkdown = `
### 📑 Detail Carousel InstaDeck
- **ID**: \`${content.id}\`
- **Headline**: **${content.headline}**
- **Template**: \`${contentStyle}\` (${contentFormat})
- **Jumlah Slide**: ${rawSlides.length} Slide
- **Studio Link**: [Buka Studio Editor](https://pro.instadeck.id/result/${content.id})

#### Slide List:
${rawSlides
  .map(
    (s: any, idx: number) =>
      `**Slide ${idx + 1}**: ${s.headline || s.title || s.takeaway || '-'}\n* Isi: ${s.body || s.lead || s.supportingText || '-'}\n* Foto: ${content.visuals?.[idx]?.imageUrl ? `[Lihat Foto](${content.visuals[idx].imageUrl})` : 'Tanpa Foto'}`
  )
  .join('\n\n')}
        `.trim();

        return jsonRpcResponse(id, {
          content: [{ type: 'text', text: contentMarkdown }],
        });
      }

      return jsonRpcError(id, -32601, `Method tool "${toolName}" tidak ditemukan.`);
    }

    return jsonRpcError(id, -32601, `Method "${method}" tidak didukung oleh InstaDeck MCP Server.`);
  } catch (err: any) {
    console.error('[MCP Error]:', err);
    return jsonRpcError(id, -32000, `Terjadi kesalahan di server InstaDeck MCP: ${err?.message || String(err)}`);
  }
}
