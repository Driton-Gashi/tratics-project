import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import MovieCard, { type MovieCardData } from '@/components/MovieCard';
import {
  wpFetchMovies,
  getPosterUrl,
  wpFetchGenres,
  getTitleText,
  getReleaseYear,
  getRating,
} from '@/lib/wp';

type MoviesSearchParams = {
  q?: string | string[];
  page?: string | string[];
  genre?: string | string[];
};

type MoviesPageProps = {
  searchParams?: Promise<MoviesSearchParams>;
};

function coerceSearchParam(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function coerceNumberParam(value?: string | string[]): number | undefined {
  const str = coerceSearchParam(value);
  const num = Number(str);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const searchQuery = coerceSearchParam(resolvedSearchParams.q).trim();
  const currentPage = Number(coerceSearchParam(resolvedSearchParams.page) || '1') || 1;
  const genreId = coerceNumberParam(resolvedSearchParams.genre);
  const perPage = 12;

  const result = await wpFetchMovies({
    q: searchQuery,
    page: currentPage,
    perPage,
    genre: genreId,
  });

  // Fetch all media and genres in parallel
  const mediaPromises = result.data.map(movie => getPosterUrl(movie.featured_media));
  const posterUrls = await Promise.all(mediaPromises);

  const allGenreIds = new Set<number>();
  for (const movie of result.data) {
    if (movie.genre) {
      for (const genreId of movie.genre) {
        allGenreIds.add(genreId);
      }
    }
  }

  const genres = await wpFetchGenres(Array.from(allGenreIds));
  const genreMap = new Map(genres.map(g => [g.id, g.name]));

  const movies: MovieCardData[] = result.data.map((movie, index) => ({
    id: movie.id,
    slug: movie.slug,
    title: getTitleText(movie),
    year: getReleaseYear(movie),
    rating: getRating(movie),
    posterUrl: posterUrls[index],
    genres: movie.genre?.map(id => genreMap.get(id) ?? '').filter(Boolean) ?? [],
  }));

  const totalPages = result.totalPages;

  return (
    <PageContainer
      title="Movies"
      description={searchQuery ? `Results for "${searchQuery}"` : 'Browse movies from WordPress.'}
      rightSlot={
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Page {currentPage} / {totalPages || 1}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link
          href={buildMoviesHref({ q: searchQuery, page: Math.max(1, currentPage - 1), genre: genreId })}
          className={getPaginationButtonClass(currentPage <= 1)}
        >
          Previous
        </Link>

        <Link
          href={buildMoviesHref({ q: searchQuery, page: currentPage + 1, genre: genreId })}
          className={getPaginationButtonClass(totalPages > 0 && currentPage >= totalPages)}
        >
          Next
        </Link>
      </div>

      {movies.length === 0 && (
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No movies found
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Try another search term.
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function buildMoviesHref({ q, page, genre }: { q?: string; page: number; genre?: number }): string {
  const params = new URLSearchParams();
  const trimmed = typeof q === 'string' ? q.trim() : '';

  if (trimmed) params.set('q', trimmed);
  if (page > 1) params.set('page', String(page));
  if (genre) params.set('genre', String(genre));

  const queryString = params.toString();
  return queryString ? `/movies?${queryString}` : '/movies';
}

function getPaginationButtonClass(isDisabled: boolean): string {
  const base =
    'rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700';
  return isDisabled ? `${base} pointer-events-none opacity-50` : base;
}
