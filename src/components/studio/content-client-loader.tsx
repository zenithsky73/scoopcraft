'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CarouselStudio } from '@/components/studio/carousel-studio';
import { Sparkles } from 'lucide-react';

export function ContentClientLoader({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`run_${id}`);
      if (saved) {
        setData(JSON.parse(saved));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('SessionStorage read error:', e);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="size-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-slate-300">Memuat Carousel Studio...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white text-center">
        <div className="max-w-md space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-black text-white">Proyek Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">
            Konten ini mungkin telah dihapus atau dibuat pada sesi lain.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full h-11 rounded-xl bg-primary text-xs font-bold text-white shadow-lg"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const rawSlides = data.content.slides || [];
  const slideList = Array.isArray(rawSlides?.slides)
    ? rawSlides.slides
    : Array.isArray(rawSlides)
    ? rawSlides
    : [];

  return (
    <CarouselStudio
      initialContent={{
        headline: data.content.headline,
        caption: data.content.caption,
        hashtags: data.content.hashtags || [],
        cta: data.content.cta || 'Simpan & Bagikan!',
        angle: data.content.angle,
        slides: slideList,
      }}
      article={{
        title: data.article?.title || data.content.headline,
        source: data.article?.source || 'Newsly AI',
        url: data.article?.url,
        imageUrl: data.article?.imageUrl || data.content.visualUrl,
        author: data.article?.author || 'Redaksi',
      }}
      initialStyle={data.style || 'BREAKING_NEWS'}
      initialFormat={data.format || 'FEED_PORTRAIT'}
      isProUser={true}
    />
  );
}
