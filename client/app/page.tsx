import Link from 'next/link';

type FeaturedItem = {
  id: string;
  title: string;
  year: number;
  type: 'Movie' | 'Series';
  rating: number; // 0-10
  poster: string; // placeholder (replace later)
  href: string;
};

const FEATURED: FeaturedItem[] = [
  {
    id: '1',
    title: 'The Last Horizon',
    year: 2024,
    type: 'Movie',
    rating: 8.4,
    poster: '/posters/placeholder-1.jpg',
    href: '/movies/the-last-horizon',
  },
  {
    id: '2',
    title: 'City of Echoes',
    year: 2023,
    type: 'Series',
    rating: 8.1,
    poster: '/posters/placeholder-2.jpg',
    href: '/series/city-of-echoes',
  },
  {
    id: '3',
    title: 'Midnight Protocol',
    year: 2022,
    type: 'Movie',
    rating: 7.9,
    poster: '/posters/placeholder-3.jpg',
    href: '/movies/midnight-protocol',
  },
  {
    id: '4',
    title: 'Northbound',
    year: 2021,
    type: 'Movie',
    rating: 7.6,
    poster: '/posters/placeholder-4.jpg',
    href: '/movies/northbound',
  },
];

function ScorePill({ rating }: { rating: number }) {
  const label = rating >= 8 ? 'Excellent' : rating >= 7 ? 'Good' : 'Rated';
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300">
      <span className="font-semibold text-slate-900 dark:text-slate-100">{rating.toFixed(1)}</span>
      <span className="text-slate-500 dark:text-slate-400">•</span>
      <span>{label}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-slate-900/10 dark:from-slate-100/5 dark:to-slate-100/10" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Your personal library
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Track what you watch. Discover what&apos;s next.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Browse movies and series, build your watchlist, save favorites, and keep everything
              organized in one place.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/movies"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Browse Movies
              </Link>
              <Link
                href="/me/watchlist"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                View Watchlist
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
                Search built-in
              </span>
              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
                Watchlist & favorites
              </span>
              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
                Admin uploads
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick navigation cards */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Explore</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Jump directly into a section.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/movies"
            className="group rounded-2xl border border-black/10 bg-white p-5 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Movies
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Browse and search films
                </div>
              </div>
              <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-700">
                Go
              </span>
            </div>
            <div className="mt-4 h-1 w-12 rounded-full bg-slate-900/20 transition group-hover:w-20 dark:bg-slate-400/20" />
          </Link>

          <Link
            href="/series"
            className="group rounded-2xl border border-black/10 bg-white p-5 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Series
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Track seasons and shows
                </div>
              </div>
              <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-700">
                Go
              </span>
            </div>
            <div className="mt-4 h-1 w-12 rounded-full bg-slate-900/20 transition group-hover:w-20 dark:bg-slate-400/20" />
          </Link>

          <Link
            href="/collections"
            className="group rounded-2xl border border-black/10 bg-white p-5 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Collections
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Curated sets and lists
                </div>
              </div>
              <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-700">
                Go
              </span>
            </div>
            <div className="mt-4 h-1 w-12 rounded-full bg-slate-900/20 transition group-hover:w-20 dark:bg-slate-400/20" />
          </Link>
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Trending now
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Popular picks to get you started.
            </p>
          </div>

          <Link
            href="/movies"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800">
                {/* Replace this with <Image /> later */}
                <div className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  Poster
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.type} • {item.year}
                    </div>
                  </div>
                  <ScorePill rating={item.rating} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Open details</span>
                  <span className="rounded-lg border border-black/10 px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:text-slate-300">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Continue / Watchlist prompt */}
      <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Keep your list up to date
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Save titles you want to watch and mark favorites.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/me/watchlist"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Watchlist
            </Link>
            <Link
              href="/me/favorites"
              className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Favorites
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
