import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';

export const runtime = 'nodejs';

function getReplizAuthHeader(): string {
  const accessKey = process.env.REPLIZ_ACCESS_KEY || '1560814458';
  const secretKey = process.env.REPLIZ_SECRET_KEY || 'JZPZGT5xNSCcSyNt3LRRnOy6Mzb3lNV0';
  return 'Basic ' + Buffer.from(`${accessKey}:${secretKey}`).toString('base64');
}

const REPLIZ_BASE_URL = process.env.REPLIZ_API_BASE_URL || 'https://api.repliz.com/public';

export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || 'ALL';
  const countryCode = searchParams.get('countryCode') || 'ID';
  const dateRange = searchParams.get('dateRange') || '7DAY';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '25';

  try {
    let url = `${REPLIZ_BASE_URL}/tiktok/music?genre=${encodeURIComponent(genre)}&countryCode=${encodeURIComponent(countryCode)}&dateRange=${encodeURIComponent(dateRange)}&page=${page}&limit=${limit}`;
    if (search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: getReplizAuthHeader(),
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ docs: [], total: 0 });
    }

    const data = await res.json();
    const docs = Array.isArray(data) ? data : (data.docs || data.data || []);

    return NextResponse.json({
      success: true,
      docs,
      total: data.totalDocs || docs.length || 0,
    });
  } catch (err: any) {
    console.error('[TikTok Music API Error]:', err?.message);
    return NextResponse.json({ success: false, docs: [], total: 0 });
  }
}
