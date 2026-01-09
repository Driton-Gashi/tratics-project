import Link from 'next/link';

export type PosterCardData = {
  id: number;
  slug: string;
  title: string;
  year?: number;
  rating?: number;
  posterUrl?: string | null;
  type: 'movie' | 'series';
};

function PosterFallback({ title }: { title: string }) {
  const initials =
    title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('') || '?';

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">
        {initials}
      </div>
    </div>
  );
}

export default function PosterCard({ item }: { item: PosterCardData }) {
  const poster = typeof item.posterUrl === 'string' ? item.posterUrl.trim() : '';
  const href = item.type === 'movie' ? `/movies/${item.slug}` : `/series/${item.slug}`;

  return (
    <Link
      href={href}
      className="group relative block shrink-0 snap-start transition-transform hover:scale-105"
    >
      <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 sm:w-48">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <PosterFallback title={item.title} />
        )}

        {typeof item.rating === 'number' && (
          <div className="absolute right-2 top-2">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 max-w-40 sm:max-w-48">
        <div className="truncate text-sm font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
          {item.title}
        </div>
        {item.year && (
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.year}</div>
        )}
      </div>
    </Link>
  );
}
