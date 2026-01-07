import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import MovieCard, { type MovieCardData } from '@/components/MovieCard';
import { wpFetchMovies, getFeaturedImageUrl, getGenres, getReleaseYear, getRating } from '@/lib/wp';

type MoviesSearchParams = {
  q?: string;
  page?: string;
};

export default async function MoviesPage({ searchParams }: { searchParams?: MoviesSearchParams }) {
  const searchQuery = searchParams?.q ?? '';
  const currentPage = Number(searchParams?.page ?? '1') || 1;
  const perPage = 12;

  const result = await wpFetchMovies({
    q: searchQuery,
    page: currentPage,
    perPage,
  });

   const movies: MovieCardData[] = result.data.map(movie => ({
     id: movie.id,
     slug: movie.slug,
     title: movie.title?.rendered ?? 'Untitled',
     year: getReleaseYear(movie),
     rating: getRating(movie),
     posterUrl: getFeaturedImageUrl(movie),
     genres: getGenres(movie),
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
          href={buildMoviesHref({ q: searchQuery, page: Math.max(1, currentPage - 1) })}
          className={getPaginationButtonClass(currentPage <= 1)}
        >
          Previous
        </Link>

        <Link
          href={buildMoviesHref({ q: searchQuery, page: currentPage + 1 })}
          className={getPaginationButtonClass(totalPages > 0 && currentPage >= totalPages)}
        >
          Next
        </Link>
      </div>

      {movies.length === 0 && (
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">No movies found</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Try another search term.</div>
        </div>
      )}
    </PageContainer>
  );
}

function buildMoviesHref({ q, page }: { q?: string; page: number }): string {
  const params = new URLSearchParams();
  const trimmed = typeof q === 'string' ? q.trim() : '';
  if (trimmed) params.set('q', trimmed);
  if (page > 1) params.set('page', String(page));
  const queryString = params.toString();
  return queryString ? `/movies?${queryString}` : '/movies';
}

function getPaginationButtonClass(isDisabled: boolean): string {
  const base =
    'rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700';
  return isDisabled ? `${base} pointer-events-none opacity-50` : base;
}
