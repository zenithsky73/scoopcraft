/**
 * Repliz.id API Client
 * Official Omni-Channel Engine for InstaDeck PRO Auto-Post & Schedule
 */

export interface ReplizAccount {
  _id: string;
  id?: string;
  platform?: "instagram" | "tiktok" | "threads" | "facebook" | "youtube" | "twitter" | "linkedin" | "shopee" | string;
  type?: string;
  name: string;
  username: string;
  avatar?: string;
  picture?: string;
  status?: string;
  createdAt?: string;
}

function getReplizAuthHeader(): string {
  const accessKey = process.env.REPLIZ_ACCESS_KEY || "1560814458";
  const secretKey = process.env.REPLIZ_SECRET_KEY || "JZPZGT5xNSCcSyNt3LRRnOy6Mzb3lNV0";
  return "Basic " + Buffer.from(`${accessKey}:${secretKey}`).toString("base64");
}

const REPLIZ_BASE_URL = process.env.REPLIZ_API_BASE_URL || "https://api.repliz.com/public";

/**
 * Fetch connected social accounts from Repliz Master pool
 */
export async function getReplizAccounts(page = 1, limit = 50): Promise<{ docs: ReplizAccount[]; total: number }> {
  try {
    const res = await fetch(`${REPLIZ_BASE_URL}/account?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: getReplizAuthHeader(),
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Repliz Account API responded with ${res.status}`);
    }

    const data = await res.json();
    const docs = (data.docs || []).map((d: any) => ({
      ...d,
      _id: d._id || d.id,
      id: d._id || d.id,
      platform: d.type || d.platform,
      type: d.type || d.platform,
      avatar: d.picture || d.avatar || null,
      picture: d.picture || d.avatar || null,
      name: d.name || d.username || 'Akun',
      username: d.username || d.name || 'Akun',
    }));

    return {
      docs,
      total: data.totalDocs || docs.length || 0,
    };
  } catch (err: any) {
    console.warn("[Repliz Client Warning]:", err?.message);
    return { docs: [], total: 0 };
  }
}

/**
 * Fetch single connected social account by ID from Repliz
 */
export async function getReplizAccountById(accountId: string): Promise<ReplizAccount | null> {
  if (!accountId) return null;
  try {
    const res = await fetch(`${REPLIZ_BASE_URL}/account/${accountId}`, {
      headers: {
        Authorization: getReplizAuthHeader(),
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return null;
    }

    const d = await res.json();
    if (!d || (!d._id && !d.id)) return null;

    return {
      ...d,
      _id: d._id || d.id,
      id: d._id || d.id,
      platform: d.type || d.platform,
      type: d.type || d.platform,
      avatar: d.picture || d.avatar || null,
      picture: d.picture || d.avatar || null,
      name: d.name || d.username || 'Akun',
      username: d.username || d.name || 'Akun',
    };
  } catch (err: any) {
    console.warn("[Repliz Get Account By ID Warning]:", err?.message);
    return null;
  }
}

/**
 * Get count of accounts per platform in Repliz
 */
export async function getReplizAccountCount(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${REPLIZ_BASE_URL}/account/count`, {
      headers: {
        Authorization: getReplizAuthHeader(),
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    console.warn("[Repliz Count Warning]:", err?.message);
  }
  return { total: 0, limit: 200 };
}

/**
 * Get official OAuth Authorization URL for Instagram, TikTok, Threads, etc.
 */
export async function getReplizOAuthUrl(platform: string, redirectUrl: string): Promise<string> {
  const normPlatform = platform.toLowerCase();
  const res = await fetch(`${REPLIZ_BASE_URL}/account/${normPlatform}/authorize?redirect=${encodeURIComponent(redirectUrl)}`, {
    headers: {
      Authorization: getReplizAuthHeader(),
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data?.message || `Gagal mendapatkan URL otorisasi ${platform} dari Repliz.`);
  }

  return data.url;
}

/**
 * Exchange OAuth Code from Instagram / TikTok / Threads callback with Repliz
 */
export async function connectReplizOAuthAccount(platform: string, code: string): Promise<{ success: boolean; account?: any; error?: string }> {
  try {
    const normPlatform = platform.toLowerCase();
    const res = await fetch(`${REPLIZ_BASE_URL}/account/${normPlatform}/connect`, {
      method: "POST",
      headers: {
        Authorization: getReplizAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.message || `Gagal menautkan akun ${platform} (${res.status})`,
      };
    }

    // Attempt to extract or enrich full account details
    let account = data.data || data.account || data.doc || data;
    const accountId = account._id || account.id || account.accountId;

    // If details like username are missing from connect response, fetch fresh object by accountId
    if (accountId && (!account.username || !account.picture)) {
      const fresh = await getReplizAccountById(accountId);
      if (fresh) {
        account = { ...account, ...fresh };
      }
    }

    return {
      success: true,
      account,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Gagal menghubungi server Repliz.",
    };
  }
}

export interface ReplizSchedulePayload {
  accountId: string;
  platform: string;
  title?: string;
  caption: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledAt: Date | string;
  metadata?: Record<string, any>;
}

export interface ReplizScheduleResult {
  success: boolean;
  scheduleId?: string;
  error?: string;
}

/**
 * Create a new scheduled post in Repliz
 */
export async function createReplizSchedule(payload: ReplizSchedulePayload): Promise<ReplizScheduleResult> {
  try {
    const rawMediaUrls = (payload.mediaUrls || []).filter(Boolean);
    const medias = rawMediaUrls.map((url) => ({
      type: (url.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image') as 'image' | 'video',
      url,
    }));

    const tags = (payload.hashtags || [])
      .map((h) => h.replace(/^#/, '').trim())
      .filter(Boolean);

    const postType = medias.length > 1
      ? 'album'
      : medias.length === 1
      ? (medias[0].type === 'video' ? 'video' : 'image')
      : 'text';

    const reqBody = {
      accountId: payload.accountId,
      title: payload.title || payload.caption.slice(0, 60),
      description: payload.caption || '',
      topic: '',
      type: postType,
      medias,
      meta: { title: '', description: '', url: '' },
      additionalInfo: {
        isAiGenerated: false,
        isDraft: false,
        collaborators: [],
        music: { id: '', artist: '', name: '', thumbnail: '' },
        products: [],
        tags,
        mentions: [],
        link: '',
      },
      replies: [],
      scheduleAt: new Date(payload.scheduledAt).toISOString(),
      ...payload.metadata,
    };

    const res = await fetch(`${REPLIZ_BASE_URL}/schedule`, {
      method: "POST",
      headers: {
        Authorization: getReplizAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.message || `Gagal menjadwalkan ke ${payload.platform} (${res.status})`,
      };
    }

    return {
      success: true,
      scheduleId: data.scheduleId || data._id || data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Gagal menghubungi server Repliz.",
    };
  }
}

/**
 * Delete / cancel a scheduled post in Repliz
 */
export async function deleteReplizSchedule(scheduleId: string): Promise<boolean> {
  try {
    const res = await fetch(`${REPLIZ_BASE_URL}/schedule/${scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: getReplizAuthHeader(),
        Accept: "application/json",
      },
    });
    return res.ok;
  } catch (err: any) {
    console.warn("[Repliz Delete Schedule Warning]:", err?.message);
    return false;
  }
}
