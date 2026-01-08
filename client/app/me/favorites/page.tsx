import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import MovieCard, { type MovieCardData } from '@/components/MovieCard';
import SeriesCard, { type SeriesCardData } from '@/components/SeriesCard';
import { meApi } from '@/src/lib/api';
import {
  wpFetchMovies,
  wpFetchSeries,
  wpFetchEpisodes,
  getPosterUrl,
  getTitleText,
  getReleaseYear,
  getRating,
  type WPMovie,
  type WPSeries,
  type WPEpisode,
} from '@/lib/wp';

async function fetchListItems(listRows: Array<{ item_type: string; wp_post_id: number }>) {
  const movies = listRows.filter(r => r.item_type === 'movie');
  const series = listRows.filter(r => r.item_type === 'series');
  const episodes = listRows.filter(r => r.item_type === 'episode');

  const [movieData, seriesData, episodeData] = await Promise.all([
    movies.length > 0
      ? wpFetchMovies({
          perPage: 100,
        })
      : Promise.resolve({ data: [] as WPMovie[], totalPages: 0 }),
    series.length > 0
      ? wpFetchSeries({
          perPage: 100,
        })
      : Promise.resolve({ data: [] as WPSeries[], totalPages: 0 }),
    episodes.length > 0
      ? wpFetchEpisodes()
      : Promise.resolve([] as WPEpisode[]),
  ]);

  // Filter to only items in the list
  const movieIds = new Set(movies.map(m => m.wp_post_id));
  const seriesIds = new Set(series.map(s => s.wp_post_id));
  const episodeIds = new Set(episodes.map(e => e.wp_post_id));

  const filteredMovies = movieData.data.filter(m => movieIds.has(m.id));
  const filteredSeries = seriesData.data.filter(s => seriesIds.has(s.id));
  const filteredEpisodes = episodeData.filter(e => episodeIds.has(e.id));

  return { filteredMovies, filteredSeries, filteredEpisodes };
}

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  // Convert cookies to header string format
  const cookieHeader = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  let listRows;
  try {
    listRows = await meApi.getLists({ list_type: 'favorite' }, cookieHeader);
  } catch (error) {
    redirect('/login');
  }

  if (listRows.length === 0) {
    return (
      <PageContainer title="Favorites" description="Your favorite titles">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Your favorites list is empty
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Add movies and series to your favorites to see them here.
          </div>
          <Link
            href="/movies"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Browse Movies
          </Link>
        </div>
      </PageContainer>
    );
  }

  const { filteredMovies, filteredSeries, filteredEpisodes } = await fetchListItems(listRows);

  // Fetch posters
  const moviePosters = await Promise.all(
    filteredMovies.map(m => getPosterUrl(m.featured_media))
  );
  const seriesPosters = await Promise.all(
    filteredSeries.map(s => getPosterUrl(s.featured_media))
  );

  const movieCards: MovieCardData[] = filteredMovies.map((m, i) => ({
    id: m.id,
    slug: m.slug,
    title: getTitleText(m),
    year: getReleaseYear(m),
    rating: getRating(m),
    posterUrl: moviePosters[i],
    genres: [],
  }));

  const seriesCards: SeriesCardData[] = filteredSeries.map((s, i) => ({
    id: s.id,
    slug: s.slug,
    title: getTitleText(s),
    posterUrl: seriesPosters[i],
    genres: [],
  }));

  return (
    <PageContainer title="Favorites" description="Your favorite titles">
      <div className="space-y-8">
        {movieCards.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Movies ({movieCards.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {movieCards.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {seriesCards.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Series ({seriesCards.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {seriesCards.map(series => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          </div>
        )}

        {filteredEpisodes.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Episodes ({filteredEpisodes.length})
            </h2>
            <div className="rounded-xl border border-black/10 bg-white/50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400">
              Episode support coming soon. Episodes are saved but not yet displayed here.
            </div>
          </div>
        )}

        {movieCards.length === 0 && seriesCards.length === 0 && filteredEpisodes.length === 0 && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              No items found
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The items in your favorites may have been removed from WordPress.
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
