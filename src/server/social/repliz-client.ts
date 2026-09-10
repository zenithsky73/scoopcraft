/**
 * Repliz.id API Client
 * Official Omni-Channel Engine for InstaDeck PRO Auto-Post & Schedule
 */

export interface ReplizAccount {
  _id: string;
  platform: "instagram" | "tiktok" | "threads" | "facebook" | "youtube" | "twitter" | "linkedin" | "shopee";
  name: string;
  username: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

export interface ReplizSchedulePayload {
  accountId: string;
  platform: string;
  caption: string;
  mediaUrls?: string[];
  scheduledAt: Date | string;
  metadata?: Record<string, any>;
}

export interface ReplizScheduleResult {
  success: boolean;
  scheduleId?: string;
  error?: string;
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
    return {
      docs: data.docs || [],
      total: data.totalDocs || 0,
    };
  } catch (err: any) {
    console.warn("[Repliz Client Warning]:", err?.message);
    return { docs: [], total: 0 };
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
 * Create a new scheduled post in Repliz
 */
export async function createReplizSchedule(payload: ReplizSchedulePayload): Promise<ReplizScheduleResult> {
  try {
    const res = await fetch(`${REPLIZ_BASE_URL}/schedule`, {
      method: "POST",
      headers: {
        Authorization: getReplizAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        accountId: payload.accountId,
        platform: payload.platform.toLowerCase(),
        caption: payload.caption,
        mediaUrls: payload.mediaUrls || [],
        scheduledAt: new Date(payload.scheduledAt).toISOString(),
        ...payload.metadata,
      }),
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
      scheduleId: data._id || data.id || data.scheduleId,
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