import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import StreamPlayer, { createStreamPlayerProps } from '@/components/StreamPlayer';
import {
  wpFetchMovieBySlug,
  getPosterUrl,
  wpFetchGenres,
  getGenreNames,
  getTitleText,
  getReleaseYear,
  getRating,
  getRuntime,
  getTrailerUrl,
} from '@/lib/wp';

export default async function MovieDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  const movie = await wpFetchMovieBySlug(slug);

  if (!movie) notFound();

  const title = getTitleText(movie);
  const year = getReleaseYear(movie);
  const rating = getRating(movie);
  const runtime = getRuntime(movie);
  const posterUrl = await getPosterUrl(movie.featured_media);
  const trailerUrl = getTrailerUrl(movie);

  // Fetch genres
  const genreIds = movie.genre ?? [];
  const genres = await wpFetchGenres(genreIds);
  const genreNames = getGenreNames(genres);

  const streamProps = createStreamPlayerProps(movie);

  return (
    <PageContainer title={title} description={`${year}${runtime ? ` • ${runtime} min` : ''}`}>
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                  {year}
                </span>

                {typeof rating === 'number' && (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100">
                    IMDb {rating.toFixed(1)}
                  </span>
                )}

                {runtime ? (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                    {runtime} min
                  </span>
                ) : null}
              </div>

              {genreNames.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
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

              <div className="mt-4 flex flex-col gap-2">
                {trailerUrl ? (
                  <a
                    href={trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Watch trailer
                  </a>
                ) : null}

                <Link
                  href="/movies"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Back to Movies
                </Link>
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
          <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">About</div>

            <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              {movie.content?.rendered ? (
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: movie.content.rendered }}
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400">
                  Add an excerpt/description in WordPress to show details here.
                </p>
              )}
            </div>
          </div>

          {/* Quick facts */}
          <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Quick facts
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-slate-700/50">
                <dt className="text-xs text-slate-500 dark:text-slate-400">Release year</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {year}
                </dd>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-slate-700/50">
                <dt className="text-xs text-slate-500 dark:text-slate-400">Runtime</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {runtime ? `${runtime} min` : '—'}
                </dd>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-slate-700/50">
                <dt className="text-xs text-slate-500 dark:text-slate-400">IMDb rating</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {typeof rating === 'number' ? rating.toFixed(1) : '—'}
                </dd>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-slate-700/50">
                <dt className="text-xs text-slate-500 dark:text-slate-400">Provider</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {streamProps.streamProvider ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
