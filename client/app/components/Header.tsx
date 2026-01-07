'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/src/contexts/ThemeProvider';

type HeaderProps = {
  onOpenSidebar: () => void;
};

const cn = (...classes: Array<string | false | undefined | null>) =>
  classes.filter(Boolean).join(' ');

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = searchParams?.get('q') ?? '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(q);
  }, [searchParams]);

  const isSearchPage = useMemo(() => pathname?.startsWith('/movies'), [pathname]);

  // Placeholder auth state (wire later)
  const isAuthed = false;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams?.toString());

    if (!trimmed) params.delete('q');
    else params.set('q', trimmed);

    router.push(`/movies?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        {/* Mobile: open sidebar */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-400 md:hidden"
          aria-label="Open navigation"
        >
          <span className="relative block h-5 w-6">
            <span className="absolute left-0 top-1 block h-0.5 w-6 bg-current" />
            <span className="absolute left-0 top-2.5 block h-0.5 w-6 bg-current" />
            <span className="absolute left-0 top-4 block h-0.5 w-6 bg-current" />
          </span>
        </button>

        {/* Search */}
        <form onSubmit={submitSearch} className="flex w-full items-center">
          <div className="relative w-full">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies..."
              className={cn(
                'w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none',
                'placeholder:text-slate-400',
                'focus:ring-2 focus:ring-slate-900/20',
                'dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-slate-400/20'
              )}
              aria-label="Search movies"
            />

            {/* Clear (only when typing) */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-11 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}

            {/* Search icon button (submit) */}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-400"
              aria-label="Search"
              title="Search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* User actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-400"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <div className="hidden items-center gap-2 md:flex">
          {!isAuthed ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Register
              </Link>
            </>
          ) : (
            <Link
              href="/me"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                U
              </span>
              <span>Account</span>
            </Link>
          )}
          </div>
        </div>
      </div>

      {isSearchPage && (
        <div className="border-t border-black/10 bg-white/70 dark:border-white/10 dark:bg-slate-900/70">
          <div className="mx-auto max-w-6xl px-4 py-2 text-xs text-slate-500 dark:text-slate-400 sm:px-6">
            Tip: Use the sidebar for navigation. Search filters live on the Movies page.
          </div>
        </div>
      )}
    </header>
  );
}
