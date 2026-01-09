import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import MovieCard, { type MovieCardData } from '@/components/MovieCard';
import SeriesCard, { type SeriesCardData } from '@/components/SeriesCard';
import EpisodeCard, { type EpisodeCardData } from '@/components/EpisodeCard';
import {
  getPosterUrl,
  getTitleText,
  getReleaseYear,
  getRating,
  wpFetchAllGenres,
  wpFetchEpisodes,
  wpFetchGenres,
  wpFetchMovies,
  wpFetchSeries,
  type WPGenre,
} from '@/lib/wp';

type SearchParams = {
  q?: string | string[];
};

type SearchPageProps = {
  searchParams?: Promise<SearchParams>;
};

function coerceSearchParam(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function filterGenres(genres: WPGenre[], query: string): WPGenre[] {
  const search = query.trim().toLowerCase();
  if (!search) return [];

  return genres.filter(genre => {
    const name = genre.name.toLowerCase();
    const slug = genre.slug.toLowerCase();
    return name.includes(search) || slug.includes(search);
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const searchQuery = coerceSearchParam(resolvedSearchParams.q).trim();
  const hasQuery = searchQuery.length > 0;

  if (!hasQuery) {
    return (
      <PageContainer title="Search" description="Search movies, series, episodes, and genres.">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Start typing to search
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Use the search bar above to find movies, series, episodes, or genres.
          </div>
        </div>
      </PageContainer>
    );
  }

  const [moviesResult, seriesResult, episodes, allGenres] = await Promise.all([
    wpFetchMovies({ q: searchQuery, perPage: 12, page: 1 }),
    wpFetchSeries({ q: searchQuery, perPage: 12, page: 1 }),
    wpFetchEpisodes(),
    wpFetchAllGenres(),
  ]);

  const filteredEpisodes = episodes
    .filter(ep => getTitleText(ep).toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 12);

  const matchedGenres = filterGenres(allGenres, searchQuery).slice(0, 12);

  const moviePosterUrls = await Promise.all(
    moviesResult.data.map(movie => getPosterUrl(movie.featured_media))
  );
  const seriesPosterUrls = await Promise.all(
    seriesResult.data.map(series => getPosterUrl(series.featured_media))
  );
  const episodePosterUrls = await Promise.all(
    filteredEpisodes.map(ep => getPosterUrl(ep.featured_media))
  );

  const movieGenreIds = new Set<number>();
  for (const movie of moviesResult.data) {
    if (movie.genre) {
      for (const genreId of movie.genre) {
        movieGenreIds.add(genreId);
      }
    }
  }
  const movieGenres = await wpFetchGenres(Array.from(movieGenreIds));
  const movieGenreMap = new Map(movieGenres.map(g => [g.id, g.name]));

  const seriesGenreIds = new Set<number>();
  for (const series of seriesResult.data) {
    if (series.genre) {
      for (const genreId of series.genre) {
        seriesGenreIds.add(genreId);
      }
    }
  }
  const seriesGenres = await wpFetchGenres(Array.from(seriesGenreIds));
  const seriesGenreMap = new Map(seriesGenres.map(g => [g.id, g.name]));

  const movies: MovieCardData[] = moviesResult.data.map((movie, index) => ({
    id: movie.id,
    slug: movie.slug,
    title: getTitleText(movie),
    year: getReleaseYear(movie),
    rating: getRating(movie),
    posterUrl: moviePosterUrls[index],
    genres: movie.genre?.map(id => movieGenreMap.get(id) ?? '').filter(Boolean) ?? [],
  }));

  const seriesList: SeriesCardData[] = seriesResult.data.map((series, index) => ({
    id: series.id,
    slug: series.slug,
    title: getTitleText(series),
    posterUrl: seriesPosterUrls[index],
    genres: series.genre?.map(id => seriesGenreMap.get(id) ?? '').filter(Boolean) ?? [],
  }));

  const episodeCards: EpisodeCardData[] = filteredEpisodes.map((episode, index) => ({
    id: episode.id,
    slug: episode.slug,
    title: getTitleText(episode),
    seasonNumber: episode.acf?.season_number,
    episodeNumber: episode.acf?.episode_number,
    runtime: episode.acf?.runtime_minutes,
    airDate: episode.acf?.air_date,
    posterUrl: episodePosterUrls[index],
  }));

  return (
    <PageContainer title="Search" description={`Results for "${searchQuery}"`}>
      <div className="space-y-10">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Movies</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {moviesResult.totalPages > 1 ? 'Top results' : `${movies.length} results`}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {movies.length === 0 && (
            <EmptyState message="No movies found." />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Series</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {seriesResult.totalPages > 1 ? 'Top results' : `${seriesList.length} results`}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seriesList.map(series => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
          {seriesList.length === 0 && (
            <EmptyState message="No series found." />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Episodes
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {episodeCards.length} results
            </div>
          </div>
          <div className="space-y-3">
            {episodeCards.map(episode => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
          {episodeCards.length === 0 && (
            <EmptyState message="No episodes found." />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Genres</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {matchedGenres.length} results
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchedGenres.map(genre => (
              <div
                key={genre.id}
                className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-slate-800"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {genre.name}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {genre.slug}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <Link
                    href={`/movies?genre=${genre.id}`}
                    className="rounded-lg border border-black/10 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Movies
                  </Link>
                  <Link
                    href={`/series?genre=${genre.id}`}
                    className="rounded-lg border border-black/10 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Series
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {matchedGenres.length === 0 && (
            <EmptyState message="No genres found." />
          )}
        </section>
      </div>
    </PageContainer>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">
      {message}
    </div>
  );
}
