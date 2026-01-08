import Link from 'next/link';

export type EpisodeCardData = {
  id: number;
  slug: string;
  title: string;
  seasonNumber?: number;
  episodeNumber?: number;
  posterUrl?: string | null;
  runtime?: number | null;
  airDate?: string | null;
};

function PosterFallback({ title }: { title: string }) {
  const initials =
    title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('') || 'E';

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">
        {initials}
      </div>
    </div>
  );
}

export default function EpisodeCard({ episode }: { episode: EpisodeCardData }) {
  const poster = typeof episode.posterUrl === 'string' ? episode.posterUrl.trim() : '';
  const season = episode.seasonNumber ?? 0;
  const episodeNum = episode.episodeNumber ?? 0;

  return (
    <Link
      href={`/watch/episode/${episode.slug}`}
      className="group flex gap-3 overflow-hidden rounded-xl border border-black/10 bg-white transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      <div className="relative h-20 w-32 shrink-0 bg-slate-100 dark:bg-slate-800">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={episode.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <PosterFallback title={episode.title} />
        )}
      </div>

      <div className="min-w-0 flex-1 py-3 pr-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              S{season.toString().padStart(2, '0')}E{episodeNum.toString().padStart(2, '0')}
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
              {episode.title}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {episode.runtime ? <span>{episode.runtime} min</span> : null}
          {episode.airDate ? (
            <span>
              {episode.airDate.length === 8
                ? `${episode.airDate.slice(0, 4)}-${episode.airDate.slice(4, 6)}-${episode.airDate.slice(6, 8)}`
                : episode.airDate}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
