import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import EpisodeCard, { type EpisodeCardData } from '@/components/EpisodeCard';
import ListToggleButton from '@/components/ListToggleButton';
import {
  wpFetchSeriesBySlug,
  getPosterUrl,
  wpFetchGenres,
  getGenreNames,
  getTitleText,
  wpFetchEpisodes,
  filterEpisodesBySeries,
  sortEpisodes,
  groupEpisodesBySeason,
  getPosterUrl as getEpisodePosterUrl,
} from '@/lib/wp';

export default async function SeriesDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  const series = await wpFetchSeriesBySlug(slug);

  if (!series) notFound();

  const title = getTitleText(series);
  const posterUrl = await getPosterUrl(series.featured_media);

  // Fetch genres
  const genreIds = series.genre ?? [];
  const genres = await wpFetchGenres(genreIds);
  const genreNames = getGenreNames(genres);

  // Fetch and filter episodes
  const allEpisodes = await wpFetchEpisodes();
  const seriesEpisodes = filterEpisodesBySeries(allEpisodes, series.id);
  const sortedEpisodes = sortEpisodes(seriesEpisodes);
  const episodesBySeason = groupEpisodesBySeason(sortedEpisodes);

  // Fetch episode posters
  const episodePosterPromises = sortedEpisodes.map(ep => getEpisodePosterUrl(ep.featured_media));
  const episodePosterUrls = await Promise.all(episodePosterPromises);

  const episodeMap = new Map(sortedEpisodes.map((ep, idx) => [ep.id, idx]));

  return (
    <PageContainer title={title} description="TV Series">
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
              {genreNames.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {genreNames.slice(0, 6).map(g => (
                    <span
                      key={g}
                      className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <ListToggleButton
                    listType="watchlist"
                    itemType="series"
                    wpPostId={series.id}
                    wpSlug={series.slug}
                    className="flex-1"
                  />
                  <ListToggleButton
                    listType="favorite"
                    itemType="series"
                    wpPostId={series.id}
                    wpSlug={series.slug}
                    className="flex-1"
                  />
                </div>

                <Link
                  href="/series"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Back to Series
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Episodes */}
        <div className="space-y-6">
          {/* About / Description */}
          {series.content?.rendered ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">About</div>

              <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: series.content.rendered }}
                />
              </div>
            </div>
          ) : null}

          {/* Episodes by Season */}
          <div className="space-y-6">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Episodes</div>

            {episodesBySeason.size === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  No episodes available yet.
                </div>
              </div>
            ) : (
              Array.from(episodesBySeason.entries())
                .sort(([a], [b]) => a - b)
                .map(([season, episodes]) => {
                  const episodeCards: EpisodeCardData[] = episodes.map(ep => {
                    const idx = episodeMap.get(ep.id) ?? 0;
                    return {
                      id: ep.id,
                      slug: ep.slug,
                      title: ep.title?.rendered
                        ? ep.title.rendered.replace(/<[^>]*>/g, '').trim()
                        : 'Untitled',
                      seasonNumber: ep.acf?.season_number,
                      episodeNumber: ep.acf?.episode_number,
                      posterUrl: episodePosterUrls[idx],
                      runtime: ep.acf?.runtime_minutes ?? null,
                      airDate: ep.acf?.air_date ?? null,
                    };
                  });

                  return (
                    <div key={season} className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Season {season}
                      </div>
                      <div className="space-y-2">
                        {episodeCards.map(ep => (
                          <EpisodeCard key={ep.id} episode={ep} />
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
