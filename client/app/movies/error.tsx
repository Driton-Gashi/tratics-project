'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

export default function MoviesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Movies error:', error);
  }, [error]);

  return (
    <PageContainer title="Error" description="Something went wrong">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-900/10">
        <div className="text-sm font-semibold text-red-900 dark:text-red-100">
          Failed to load movies
        </div>
        <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
          <Link
            href="/movies"
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Go to Movies
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
