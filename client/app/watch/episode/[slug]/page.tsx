import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import StreamPlayer, { createStreamPlayerProps } from '@/components/StreamPlayer';
import {
  wpFetchEpisodes,
  wpFetchSeriesById,
  getPosterUrl,
  getTitleText,
  getPosterUrl as getEpisodePosterUrl,
} from '@/lib/wp';

export default async function EpisodeWatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  // Fetch all episodes and find the one matching the slug
  const allEpisodes = await wpFetchEpisodes();
  const episode = allEpisodes.find(ep => ep.slug === slug);

  if (!episode) notFound();

  const title = getTitleText(episode);
  const posterUrl = await getEpisodePosterUrl(episode.featured_media);
  const season = episode.acf?.season_number ?? 0;
  const episodeNum = episode.acf?.episode_number ?? 0;
  const runtime = episode.acf?.runtime_minutes ?? null;
  const airDate = episode.acf?.air_date ?? null;

  // Fetch series info if available
  let seriesTitle: string | null = null;
  let seriesSlug: string | null = null;
  if (episode.acf?.series && typeof episode.acf.series === 'number') {
    const series = await wpFetchSeriesById(episode.acf.series);
    if (series) {
      seriesTitle = getTitleText(series);
      seriesSlug = series.slug;
    }
  }

  const streamProps = createStreamPlayerProps(episode);

  return (
    <PageContainer
      title={title}
      description={
        season > 0 && episodeNum > 0
          ? `S${season.toString().padStart(2, '0')}E${episodeNum.toString().padStart(2, '0')}`
          : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left column: Poster + meta */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-slate-800">
            <div className="aspect-[2/3] bg-slate-100 dark:bg-slate-800">
              {posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  No poster
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="space-y-2 text-sm">
                {season > 0 && episodeNum > 0 && (
                  <div className="text-slate-600 dark:text-slate-400">
                    Season {season} • Episode {episodeNum}
                  </div>
                )}
                {runtime && (
                  <div className="text-slate-600 dark:text-slate-400">{runtime} min</div>
                )}
                {airDate && (
                  <div className="text-slate-600 dark:text-slate-400">
                    {airDate.length === 8
                      ? `${airDate.slice(0, 4)}-${airDate.slice(4, 6)}-${airDate.slice(6, 8)}`
                      : airDate}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {seriesSlug && seriesTitle && (
                  <Link
                    href={`/series/${seriesSlug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    View Series: {seriesTitle}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Player + details */}
        <div className="space-y-6">
          {/* Streaming / Player */}
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-slate-800">
            <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Watch</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {streamProps.streamType === 'iframe'
                  ? 'Embedded player'
                  : streamProps.streamType === 'external'
                    ? 'External link'
                    : 'Not available'}
              </div>
            </div>

            <div className="p-5">
              <StreamPlayer {...streamProps} />
            </div>
          </div>

          {/* About / Description */}
          {episode.content?.rendered && (
            <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">About</div>

              <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: episode.content.rendered }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
