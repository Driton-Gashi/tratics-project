'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/src/contexts/ThemeProvider';
import { useAuth } from '@/src/contexts/AuthProvider';
import { wpFetchAllGenres, type WPGenre } from '@/lib/wp';

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
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin, refreshAuth } = useAuth();

  // Initialize query from URL, but manage it as local state for the input
  const urlQuery = searchParams?.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [genres, setGenres] = useState<WPGenre[]>([]);
  const [isGenresLoading, setIsGenresLoading] = useState(false);
  const [genresError, setGenresError] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const genresMenuRef = useRef<HTMLDivElement | null>(null);
  const prevUrlQueryRef = useRef(urlQuery);

  // Sync URL query to local state when URL changes externally
  if (urlQuery !== prevUrlQueryRef.current) {
    prevUrlQueryRef.current = urlQuery;
    setQuery(urlQuery);
  }

  useEffect(() => {
    if (!isAccountOpen && !isGenresOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(target)
      ) {
        setIsAccountOpen(false);
      }
      if (genresMenuRef.current && !genresMenuRef.current.contains(target)) {
        setIsGenresOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountOpen(false);
        setIsGenresOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isAccountOpen, isGenresOpen]);

  useEffect(() => {
    if (!isGenresOpen || genres.length > 0 || isGenresLoading) return;

    const loadGenres = async () => {
      try {
        setIsGenresLoading(true);
        setGenresError(null);
        const data = await wpFetchAllGenres();
        setGenres(data);
      } catch (error) {
        setGenresError('Failed to load genres.');
      } finally {
        setIsGenresLoading(false);
      }
    };

    loadGenres();
  }, [genres.length, isGenresLoading, isGenresOpen]);

  const handleLogout = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const apiPath = apiUrl.includes('/api') ? '' : '/api';

    try {
      await fetch(`${apiUrl}${apiPath}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Logout is idempotent; ignore network errors
    }

    setIsAccountOpen(false);
    try {
      localStorage.setItem('auth-state', 'logged-out');
      window.dispatchEvent(new Event('auth-changed'));
    } catch {
      // Ignore storage access issues
    }
    refreshAuth();
    router.push('/');
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();
    const params = new URLSearchParams();

    if (trimmed) {
      params.set('q', trimmed);
    }

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : '/search');
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
              placeholder="Search movies, series, episodes, genres..."
              className={cn(
                'w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none',
                'placeholder:text-slate-400',
                'focus:ring-2 focus:ring-slate-900/20',
                'dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-slate-400/20'
              )}
              aria-label="Search movies, series, episodes, genres"
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
          <div className="relative" ref={genresMenuRef}>
            <button
              type="button"
              onClick={() => setIsGenresOpen(prev => !prev)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus:ring-slate-400"
              aria-haspopup="menu"
              aria-expanded={isGenresOpen}
            >
              Genres
            </button>

            {isGenresOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-slate-900">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Browse by Genre
                </div>
                {isGenresLoading ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    Loading genres...
                  </div>
                ) : genresError ? (
                  <div className="py-4 text-center text-xs text-rose-600 dark:text-rose-400">
                    {genresError}
                  </div>
                ) : (
                  <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
                    {genres.map(genre => (
                      <Link
                        key={genre.id}
                        href={`/search?genre=${genre.id}`}
                        onClick={() => setIsGenresOpen(false)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
            {!isAuthenticated ? (
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
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(prev => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-haspopup="menu"
                  aria-expanded={isAccountOpen}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    U
                  </span>
                  <span>Account</span>
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-black/10 bg-white py-2 shadow-lg dark:border-white/10 dark:bg-slate-900">
                    <Link
                      href="/me"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/me/watchlist"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Watchlist
                    </Link>
                    <Link
                      href="/me/favorites"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Favorites
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="my-2 h-px bg-black/10 dark:bg-white/10" />
                        <Link
                          href="/admin"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                    <div className="my-2 h-px bg-black/10 dark:bg-white/10" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
