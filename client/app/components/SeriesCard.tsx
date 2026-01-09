import Link from 'next/link';

export type SeriesCardData = {
  id: number;
  slug: string;
  title: string;
  posterUrl?: string | null;
  genres?: string[];
};

function PosterFallback({ title }: { title: string }) {
  const initials =
    title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('') || 'S';

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="flex flex-col items-center gap-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white dark:bg-slate-700">
          {initials}
        </div>
        <div className="px-4 text-center text-xs text-slate-500 dark:text-slate-400">No poster</div>
      </div>
    </div>
  );
}

export default function SeriesCard({ series }: { series: SeriesCardData }) {
  const poster = typeof series.posterUrl === 'string' ? series.posterUrl.trim() : '';

  return (
    <Link
      href={`/series/${series.slug}`}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={series.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <PosterFallback title={series.title} />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
              {series.title}
            </div>
          </div>

          <span className="rounded-lg border border-black/10 px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:text-slate-300">
            →
          </span>
        </div>

        {series.genres?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {series.genres.slice(0, 3).map(g => (
              <span
                key={g}
                className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
              >
                {g}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
