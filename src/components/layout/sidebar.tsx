'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, isActive } from '@/components/layout/nav-items';
import { QuotaMeter } from '@/components/billing/quota-meter';
import type { QuotaState } from '@/server/billing/quota';
import { APP } from '@/config/app';
import { cn } from '@/lib/utils';

export function Sidebar({ quota }: { quota: QuotaState }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-accent text-[11px] font-bold text-accent-fg">
          S
        </span>
        <span className="text-sm font-semibold tracking-tight">{APP.name}</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <QuotaMeter quota={quota} />
      </div>
    </aside>
  );
}
