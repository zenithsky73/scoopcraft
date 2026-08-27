import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';

export function Topbar({ title, email }: { title: string; email?: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-accent text-[11px] font-bold text-accent-fg">
          S
        </span>
        <span className="text-sm font-semibold tracking-tight">Scoopcraft</span>
      </div>

      <h1 className="hidden text-sm font-semibold tracking-tight lg:block">{title}</h1>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
