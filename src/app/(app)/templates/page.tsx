import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette, Sparkles, ArrowRight, Layers, Lock, Crown } from 'lucide-react';
import { STYLES, isProStyle } from '@/config/styles';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Template Explorer — 20 Preset Desain Media Indonesia' };

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs font-bold uppercase tracking-wider mb-2">
          <Palette className="size-3.5" /> 20 Preset Desain Instagram & LinkedIn
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Katalog Gaya Visual Media Indonesia
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Eksplorasi 20 gaya desain visual yang terinspirasi dari media dan kreator terkemuka. Template bertanda <strong>GRATIS</strong> bisa dicoba bebas, dan template <strong>🔒 PRO</strong> eksklusif untuk pelanggan.
        </p>
      </div>

      {/* Grid of 20 Visual Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STYLES.map((style) => {
          const isPro = style.tier === 'PRO';

          return (
            <div
              key={style.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-6 shadow-md backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-4 rounded-full shadow-md shrink-0"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">{style.label}</h2>
                  </div>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                      <Lock className="size-2.5" /> PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                      GRATIS
                    </span>
                  )}
                </div>

                {/* Sub-label & Instagram Reference */}
                {style.subLabel && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-primary">
                      {style.subLabel}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {style.description}
                </p>

                {/* Visual Card Mockup Snippet */}
                <div
                  className="p-4 rounded-2xl border text-xs font-sans space-y-2 mb-5 select-none shadow-sm"
                  style={{
                    backgroundColor: style.bgColor,
                    color: style.textColor,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[10px] opacity-75">
                    <span
                      className="px-1.5 py-0.5 rounded font-black text-[9px] uppercase"
                      style={{ backgroundColor: style.accentColor, color: '#FFF' }}
                    >
                      {style.id === 'BREAKING_NEWS' ? 'BREAKING' : 'CONTOH SLIDE'}
                    </span>
                    <span className="font-mono">1 / 5</span>
                  </div>
                  <p
                    className={`font-black text-sm line-clamp-2 ${
                      style.id === 'EDITORIAL' ? 'font-serif' : ''
                    }`}
                    style={{
                      color: style.isLight ? '#0F172A' : '#FFFFFF',
                    }}
                  >
                    {style.label}: Headline Menarik Audiens
                  </p>
                  <p className="text-[11px] opacity-80 line-clamp-2 leading-relaxed" style={{ color: style.isLight ? '#475569' : '#CBD5E1' }}>
                    Rangkuman fakta dan poin-poin penting tersaji dalam tata letak yang sangat rapi dan berkelas.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                asChild
                className="w-full h-10 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-transparent transition-all shadow-sm"
              >
                <Link href="/dashboard" className="flex items-center justify-center gap-1.5">
                  <Sparkles className="size-3.5" /> Gunakan Gaya Ini <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
