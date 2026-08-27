import { LayoutGrid, History, Sparkles, Settings, type LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Cocokkan juga sub-path (mis. /content/abc). */
  matchPrefix?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Buat', icon: LayoutGrid },
  { href: '/content', label: 'Riwayat', icon: History, matchPrefix: true },
  { href: '/upgrade', label: 'Upgrade', icon: Sparkles },
  { href: '/settings', label: 'Setelan', icon: Settings },
];

export function isActive(pathname: string, item: NavItem) {
  return item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href;
}
