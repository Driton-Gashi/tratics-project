import HomeHero, { type HomeHeroData } from '@/components/HomeHero';
import HorizontalRow from '@/components/HorizontalRow';
import GenreChips from '@/components/GenreChips';
import PosterCard, { type PosterCardData } from '@/components/PosterCard';
import {
  wpFetchTrendingMovies,
  wpFetchTrendingSeries,
  wpFetchRecentlyAddedMovies,
  wpFetchRecentlyAddedSeries,
  wpFetchAllGenres,
  getPosterUrl,
  getTitleText,
  getExcerptText,
  getReleaseYear,
  getRating,
  type WPMovie,
  type WPSeries,
} from '@/lib/wp';
import Link from 'next/link';

// Memoize media fetches within a single request
const mediaCache = new Map<number, Promise<string | null>>();

async function getCachedPosterUrl(mediaId?: number): Promise<string | null> {
  if (!mediaId) return null;
  if (!mediaCache.has(mediaId)) {
    mediaCache.set(mediaId, getPosterUrl(mediaId));
  }
  return mediaCache.get(mediaId)!;
}

function movieToPosterCard(movie: WPMovie, posterUrl: string | null): PosterCardData {
  return {
    id: movie.id,
    slug: movie.slug,
    title: getTitleText(movie),
    year: getReleaseYear(movie),
    rating: getRating(movie),
    posterUrl: posterUrl,
    type: 'movie',
  };
}

function seriesToPosterCard(series: WPSeries, posterUrl: string | null): PosterCardData {
  return {
    id: series.id,
    slug: series.slug,
    title: getTitleText(series),
    year: getReleaseYear(series),
    posterUrl: posterUrl,
    type: 'series',
  };
}

export default async function HomePage() {
  // Fetch all data in parallel
  const [trendingMovies, trendingSeries, recentMovies, recentSeries, allGenres] = await Promise.all(
    [
      wpFetchTrendingMovies(),
      wpFetchTrendingSeries(),
      wpFetchRecentlyAddedMovies(),
      wpFetchRecentlyAddedSeries(),
      wpFetchAllGenres(),
    ]
  );

  // Resolve all poster URLs in parallel
  const trendingMoviePosters = await Promise.all(
    trendingMovies.map(m => getCachedPosterUrl(m.featured_media))
  );
  const trendingSeriesPosters = await Promise.all(
    trendingSeries.map(s => getCachedPosterUrl(s.featured_media))
  );
  const recentMoviePosters = await Promise.all(
    recentMovies.map(m => getCachedPosterUrl(m.featured_media))
  );
  const recentSeriesPosters = await Promise.all(
    recentSeries.map(s => getCachedPosterUrl(s.featured_media))
  );

  // Convert to poster cards
  const trendingMovieCards: PosterCardData[] = trendingMovies.map((m, i) =>
    movieToPosterCard(m, trendingMoviePosters[i])
  );
  const trendingSeriesCards: PosterCardData[] = trendingSeries.map((s, i) =>
    seriesToPosterCard(s, trendingSeriesPosters[i])
  );
  const recentMovieCards: PosterCardData[] = recentMovies.map((m, i) =>
    movieToPosterCard(m, recentMoviePosters[i])
  );
  const recentSeriesCards: PosterCardData[] = recentSeries.map((s, i) =>
    seriesToPosterCard(s, recentSeriesPosters[i])
  );

  // Featured hero item (highest rated movie or series)
  const featuredMovie = trendingMovies[0];
  const featuredSeries = trendingSeries[0];
  const featuredItem: HomeHeroData | null =
    featuredMovie && getRating(featuredMovie)
      ? {
          type: 'movie',
          title: getTitleText(featuredMovie),
          excerpt: getExcerptText(featuredMovie) || 'No description yet.',
          year: getReleaseYear(featuredMovie),
          rating: getRating(featuredMovie),
          posterUrl: trendingMoviePosters[0],
          href: `/movies/${featuredMovie.slug}`,
        }
      : featuredSeries
        ? {
            type: 'series',
            title: getTitleText(featuredSeries),
            excerpt: getExcerptText(featuredSeries) || 'No description yet.',
            year: getReleaseYear(featuredSeries),
            posterUrl: trendingSeriesPosters[0],
            href: `/series/${featuredSeries.slug}`,
          }
        : null;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      {featuredItem ? (
        <HomeHero item={featuredItem} />
      ) : (
        <section className="relative -mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 sm:mx-0">
          <div className="px-4 py-16 text-center sm:px-8 sm:py-24">
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Welcome to Tratics
            </h1>
            <p className="mt-4 text-lg text-white/80">Discover movies and series from WordPress</p>
          </div>
        </section>
      )}

      {/* Trending Movies */}
      <HorizontalRow
        title="Trending Movies"
        seeAllHref="/movies"
        items={trendingMovieCards}
        emptyMessage="No trending movies available yet."
      />

      {/* Trending Series */}
      <HorizontalRow
        title="Trending Series"
        seeAllHref="/series"
        items={trendingSeriesCards}
        emptyMessage="No trending series available yet."
      />

      {/* Browse by Genre */}
      <GenreChips genres={allGenres} />

      {/* Recently Added */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Recently Added
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Latest movies and series
          </p>
        </div>

        <div className="space-y-8">
          {recentMovieCards.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Movies</h3>
                <Link
                  href="/movies"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  See all →
                </Link>
              </div>
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4">
                  {recentMovieCards.map(item => (
                    <PosterCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {recentSeriesCards.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Series</h3>
                <Link
                  href="/series"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  See all →
                </Link>
              </div>
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4">
                  {recentSeriesCards.map(item => (
                    <PosterCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {recentMovieCards.length === 0 && recentSeriesCards.length === 0 && (
            <div className="rounded-xl border border-black/10 bg-white/50 p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400">
              No recently added content available yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
