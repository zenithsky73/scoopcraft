'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Palette, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Buat AI', icon: LayoutDashboard },
  { href: '/templates', label: 'Template', icon: Palette },
  { href: '/content', label: 'Riwayat', icon: History },
  { href: '/upgrade', label: 'Upgrade', icon: Sparkles, highlight: true },
  { href: '/settings', label: 'Setelan', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-slate-800/90 bg-slate-950/95 px-2 py-2 backdrop-blur-2xl lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 px-3 transition-all duration-200 min-w-[58px]',
              active
                ? 'text-white bg-primary/20 scale-105 font-bold shadow-md shadow-primary/20 ring-1 ring-primary/40'
                : item.highlight
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <item.icon
              className={cn(
                'size-5 transition-transform',
                active && 'text-primary scale-110',
                item.highlight && !active && 'text-amber-400 animate-pulse'
              )}
              aria-hidden
            />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
