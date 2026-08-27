'use client';

import * as React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function UserMenu({ email }: { email?: string | null }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <UserIcon />
        <span className="sr-only">Menu akun</span>
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-56 animate-fade-in rounded-md border border-border bg-surface p-1"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">{email ?? 'Belum masuk'}</p>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2"
          >
            <LogOut className="size-4" aria-hidden />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
