import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import SeriesCard, { type SeriesCardData } from '@/components/SeriesCard';
import { wpFetchSeries, getPosterUrl, wpFetchGenres, getTitleText } from '@/lib/wp';

type SeriesSearchParams = {
  q?: string | string[];
  page?: string | string[];
};

type SeriesPageProps = {
  searchParams?: Promise<SeriesSearchParams>;
};

function coerceSearchParam(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const searchQuery = coerceSearchParam(resolvedSearchParams.q).trim();
  const currentPage = Number(coerceSearchParam(resolvedSearchParams.page) || '1') || 1;
  const perPage = 12;

  const result = await wpFetchSeries({
    q: searchQuery,
    page: currentPage,
    perPage,
  });

  // Fetch all media and genres in parallel
  const mediaPromises = result.data.map(series => getPosterUrl(series.featured_media));
  const posterUrls = await Promise.all(mediaPromises);

  const allGenreIds = new Set<number>();
  for (const series of result.data) {
    if (series.genre) {
      for (const genreId of series.genre) {
        allGenreIds.add(genreId);
      }
    }
  }

  const genres = await wpFetchGenres(Array.from(allGenreIds));
  const genreMap = new Map(genres.map(g => [g.id, g.name]));

  const seriesList: SeriesCardData[] = result.data.map((series, index) => ({
    id: series.id,
    slug: series.slug,
    title: getTitleText(series),
    posterUrl: posterUrls[index],
    genres: series.genre?.map(id => genreMap.get(id) ?? '').filter(Boolean) ?? [],
  }));

  const totalPages = result.totalPages;

  return (
    <PageContainer
      title="Series"
      description={searchQuery ? `Results for "${searchQuery}"` : 'Browse series from WordPress.'}
      rightSlot={
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Page {currentPage} / {totalPages || 1}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {seriesList.map(series => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link
          href={buildSeriesHref({ q: searchQuery, page: Math.max(1, currentPage - 1) })}
          className={getPaginationButtonClass(currentPage <= 1)}
        >
          Previous
        </Link>

        <Link
          href={buildSeriesHref({ q: searchQuery, page: currentPage + 1 })}
          className={getPaginationButtonClass(totalPages > 0 && currentPage >= totalPages)}
        >
          Next
        </Link>
      </div>

      {seriesList.length === 0 && (
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No series found
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Try another search term.
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function buildSeriesHref({ q, page }: { q?: string; page: number }): string {
  const params = new URLSearchParams();
  const trimmed = typeof q === 'string' ? q.trim() : '';

  if (trimmed) params.set('q', trimmed);
  if (page > 1) params.set('page', String(page));

  const queryString = params.toString();
  return queryString ? `/series?${queryString}` : '/series';
}

function getPaginationButtonClass(isDisabled: boolean): string {
  const base =
    'rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700';
  return isDisabled ? `${base} pointer-events-none opacity-50` : base;
}
