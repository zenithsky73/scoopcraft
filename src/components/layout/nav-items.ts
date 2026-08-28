import {
  LayoutDashboard,
  History,
  Palette,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  /** Cocokkan juga sub-path (mis. /content/abc). */
  matchPrefix?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates', label: 'Template Explorer', icon: Palette, badge: '10 Gaya' },
  { href: '/content', label: 'Riwayat Carousel', icon: History, matchPrefix: true },
  { href: '/upgrade', label: 'Paket & Kuota', icon: Sparkles },
  { href: '/settings', label: 'Watermark & Setelan', icon: Settings },
];

export function isActive(pathname: string, item: NavItem) {
  return item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href;
}
