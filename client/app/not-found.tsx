'use client';

import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

export default function NotFound() {
  return (
    <PageContainer
      title="Page not found"
      description="The page you are looking for doesn't exist yet or has moved."
    >
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-800">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          404 - Not Found
        </div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Try a different page or head back to the homepage.
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Go home
          </Link>
          <Link
            href="/movies"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Browse movies
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
