'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type NavItem = { label: string; href: string };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    title: 'Browse',
    items: [
      { label: 'Movies', href: '/movies' },
      { label: 'Series', href: '/series' },
      { label: 'Collections', href: '/collections' },
    ],
  },
  {
    title: 'Library',
    items: [
      { label: 'Watchlist', href: '/me/watchlist' },
      { label: 'Favorites', href: '/me/favorites' },
    ],
  },
];

const cn = (...classes: Array<string | false | undefined | null>) =>
  classes.filter(Boolean).join(' ');

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const SidebarInner = (
    <>
      {/* Brand / Logo lives here */}
      <div className="flex h-16 items-center gap-2 border-b border-black/10 px-4 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-slate-700">
            M
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">MovieApp</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Navigation</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        {GROUPS.map(group => (
          <div key={group.title} className="mb-6">
            <div className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {group.title}
            </div>

            <div className="mt-2 flex flex-col gap-1">
              {group.items.map(item => {
                const active = isActive(pathname ?? '/', item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-slate-100'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-black/10 p-3 dark:border-white/10">
        <Link
          href="/settings"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          Settings
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar in the grid column */}
      <aside className="hidden md:sticky md:top-0 md:z-30 md:flex md:h-screen md:w-64 md:flex-col md:border-r md:border-black/10 md:bg-white dark:md:border-white/10 dark:md:bg-slate-900">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      <div className={cn('md:hidden', open ? 'block' : 'hidden')}>
        {/* Overlay */}
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40"
        />
        {/* Panel */}
        <aside className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] border-r border-black/10 bg-white dark:border-white/10 dark:bg-slate-900">
          <div className="flex h-16 items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Menu</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-400"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex h-[calc(100vh-4rem)] flex-col">{SidebarInner}</div>
        </aside>
      </div>
    </>
  );
}
