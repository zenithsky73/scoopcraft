import { db } from '@/server/db';
import type { SocialAccount, ScheduledPost, SocialPlatform } from '@prisma/client';

export type PublishResult = {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  isSimulated: boolean;
  error?: string;
};

/**
 * Publish a scheduled post to the selected platform.
 * Supports real Meta Graph API, LinkedIn API, and an instant Simulator for demo/testing.
 */
export async function executeScheduledPost(postId: string): Promise<PublishResult> {
  const post = await db.scheduledPost.findUnique({
    where: { id: postId },
    include: {
      socialAccount: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!post) {
    return { success: false, isSimulated: false, error: 'Postingan terjadwal tidak ditemukan.' };
  }

  // Tandai sebagai sedang diproses
  await db.scheduledPost.update({
    where: { id: postId },
    data: {
      status: 'PROCESSING',
      publishAttempts: { increment: 1 },
    },
  });

  try {
    let result: PublishResult;

    // Cek apakah akun atau post berjalan dalam mode simulasi (Testing / Demo tanpa Meta token)
    const isSimulationMode =
      post.isSimulated ||
      !post.socialAccount?.accessToken ||
      post.socialAccount.accessToken.startsWith('mock_') ||
      post.socialAccount.accessToken === 'demo_token';

    if (isSimulationMode) {
      result = await publishToSimulator(post);
    } else {
      switch (post.platform) {
        case 'INSTAGRAM':
          result = await publishToInstagram(post, post.socialAccount!);
          break;
        case 'FACEBOOK':
          result = await publishToFacebook(post, post.socialAccount!);
          break;
        case 'LINKEDIN':
          result = await publishToLinkedIn(post, post.socialAccount!);
          break;
        default:
          result = await publishToSimulator(post);
          break;
      }
    }

    if (result.success) {
      await db.scheduledPost.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          externalPostId: result.externalPostId,
          externalPostUrl: result.externalPostUrl,
          isSimulated: result.isSimulated,
          errorMessage: null,
        },
      });
    } else {
      await db.scheduledPost.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          errorMessage: result.error || 'Gagal mempublikasikan ke platform tujuan.',
        },
      });
    }

    return result;
  } catch (err: any) {
    const errorMsg = err?.message || 'Terjadi kesalahan sistem saat mempublikasikan postingan.';
    await db.scheduledPost.update({
      where: { id: postId },
      data: {
        status: 'FAILED',
        errorMessage: errorMsg,
      },
    });
    return {
      success: false,
      isSimulated: false,
      error: errorMsg,
    };
  }
}

/**
 * Simulator Publisher: Berfungsi 100% untuk demo klien dan pengetesan lokal tanpa hambatan approval Meta.
 */
async function publishToSimulator(post: ScheduledPost & { socialAccount: SocialAccount | null }): Promise<PublishResult> {
  // Simulasi waktu proses API (1.2 detik)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36);
  const platform = post.platform.toLowerCase();

  let externalPostUrl = `https://newsly.ai/preview/post/${post.id}`;
  if (post.platform === 'INSTAGRAM') {
    externalPostUrl = `https://www.instagram.com/p/sim_${timestamp}_${randomId}/`;
  } else if (post.platform === 'LINKEDIN') {
    externalPostUrl = `https://www.linkedin.com/feed/update/urn:li:share:sim_${timestamp}/`;
  }

  return {
    success: true,
    externalPostId: `sim_${platform}_${timestamp}_${randomId}`,
    externalPostUrl,
    isSimulated: true,
  };
}

/**
 * Meta Graph API: Publish Carousel to Instagram Business / Creator account
 * Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */
async function publishToInstagram(
  post: ScheduledPost,
  account: SocialAccount
): Promise<PublishResult> {
  const metadata = (account.metadata as any) || {};
  const igUserId = metadata.instagram_business_account_id || account.externalId || process.env.META_INSTAGRAM_ACCOUNT_ID;
  const accessToken = account.accessToken || process.env.META_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    return {
      success: false,
      isSimulated: false,
      error: 'ID Akun Bisnis Instagram atau Access Token belum terkonfigurasi dengan benar.',
    };
  }

  // Format caption dengan hashtags
  const hashtagsFormatted = post.hashtags?.length
    ? '\n\n' + post.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : '';
  const fullCaption = `${post.caption}${hashtagsFormatted}`;

  const mediaUrls = post.mediaUrls || [];
  if (mediaUrls.length === 0) {
    return {
      success: false,
      isSimulated: false,
      error: 'Tidak ada URL gambar slide carousel yang valid untuk diunggah.',
    };
  }

  try {
    // 1. Buat item container untuk tiap slide
    const itemContainerIds: string[] = [];
    for (const imgUrl of mediaUrls) {
      const itemRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imgUrl,
          is_carousel_item: true,
          access_token: accessToken,
        }),
      });

      const itemData = await itemRes.json();
      if (!itemRes.ok || !itemData.id) {
        throw new Error(itemData?.error?.message || 'Gagal membuat container slide Instagram.');
      }
      itemContainerIds.push(itemData.id);
    }

    // 2. Buat Carousel Container induk
    const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: itemContainerIds.join(','),
        caption: fullCaption,
        access_token: accessToken,
      }),
    });

    const carouselData = await carouselRes.json();
    if (!carouselRes.ok || !carouselData.id) {
      throw new Error(carouselData?.error?.message || 'Gagal membuat carousel container di Instagram.');
    }

    const creationId = carouselData.id;

    // 3. Publikasikan Container Carousel
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.id) {
      throw new Error(publishData?.error?.message || 'Gagal mempublikasikan postingan carousel ke Instagram.');
    }

    const publishedMediaId = publishData.id;

    // 4. Ambil permalink postingan yang baru terbit
    let permalink = `https://www.instagram.com/p/${publishedMediaId}/`;
    try {
      const linkRes = await fetch(
        `https://graph.facebook.com/v19.0/${publishedMediaId}?fields=permalink&access_token=${accessToken}`
      );
      if (linkRes.ok) {
        const linkData = await linkRes.json();
        if (linkData.permalink) permalink = linkData.permalink;
      }
    } catch {
      // Abaikan jika permalink belum ter-index segera
    }

    return {
      success: true,
      externalPostId: publishedMediaId,
      externalPostUrl: permalink,
      isSimulated: false,
    };
  } catch (err: any) {
    return {
      success: false,
      isSimulated: false,
      error: `Meta Graph API: ${err?.message || 'Koneksi gagal'}`,
    };
  }
}

/**
 * LinkedIn API: Publish Post
 */
async function publishToLinkedIn(
  post: ScheduledPost,
  account: SocialAccount
): Promise<PublishResult> {
  const authorUrn = account.externalId;
  const accessToken = account.accessToken;

  if (!authorUrn || !accessToken) {
    return {
      success: false,
      isSimulated: false,
      error: 'URN Profil LinkedIn atau Access Token belum terkonfigurasi.',
    };
  }

  const hashtagsFormatted = post.hashtags?.length
    ? '\n\n' + post.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : '';
  const fullText = `${post.caption}${hashtagsFormatted}`;

  try {
    const postPayload = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: fullText,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postPayload),
    });

    const data = await res.json();
    if (!res.ok || !data.id) {
      throw new Error(data?.message || 'Gagal memposting ke LinkedIn.');
    }

    return {
      success: true,
      externalPostId: data.id,
      externalPostUrl: `https://www.linkedin.com/feed/update/${data.id}/`,
      isSimulated: false,
    };
  } catch (err: any) {
    return {
      success: false,
      isSimulated: false,
      error: `LinkedIn API: ${err?.message || 'Koneksi gagal'}`,
    };
  }
}

/**
 * Facebook Graph API: Publish to Facebook Page (Single photo or Carousel album)
 */
async function publishToFacebook(
  post: ScheduledPost,
  account: SocialAccount
): Promise<PublishResult> {
  const pageId = account.externalId;
  const accessToken = account.accessToken;

  if (!pageId || !accessToken) {
    return {
      success: false,
      isSimulated: false,
      error: 'ID Halaman Facebook atau Access Token belum terkonfigurasi.',
    };
  }

  const hashtagsFormatted = post.hashtags?.length
    ? '\n\n' + post.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : '';
  const fullCaption = `${post.caption}${hashtagsFormatted}`;
  const mediaUrls = post.mediaUrls || [];

  try {
    if (mediaUrls.length === 1) {
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mediaUrls[0],
          caption: fullCaption,
          access_token: accessToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data?.error?.message || 'Gagal memposting gambar ke Facebook Page.');
      }
      return {
        success: true,
        externalPostId: data.post_id || data.id,
        externalPostUrl: `https://facebook.com/${data.post_id || data.id}`,
        isSimulated: false,
      };
    } else if (mediaUrls.length > 1) {
      const photoIds: string[] = [];
      for (const url of mediaUrls) {
        const pRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            published: false,
            access_token: accessToken,
          }),
        });
        const pData = await pRes.json();
        if (pData.id) photoIds.push(pData.id);
      }

      const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullCaption,
          attached_media: photoIds.map((id) => ({ media_fbid: id })),
          access_token: accessToken,
        }),
      });
      const feedData = await feedRes.json();
      if (!feedRes.ok || !feedData.id) {
        throw new Error(feedData?.error?.message || 'Gagal memposting album slide ke Facebook Page.');
      }
      return {
        success: true,
        externalPostId: feedData.id,
        externalPostUrl: `https://facebook.com/${feedData.id}`,
        isSimulated: false,
      };
    } else {
      const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullCaption,
          access_token: accessToken,
        }),
      });
      const feedData = await feedRes.json();
      if (!feedRes.ok || !feedData.id) {
        throw new Error(feedData?.error?.message || 'Gagal memposting status ke Facebook Page.');
      }
      return {
        success: true,
        externalPostId: feedData.id,
        externalPostUrl: `https://facebook.com/${feedData.id}`,
        isSimulated: false,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      isSimulated: false,
      error: `Facebook API: ${err?.message || 'Gagal memposting'}`,
    };
  }
}

