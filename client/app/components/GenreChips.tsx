import Link from 'next/link';
import { type WPGenre } from '@/lib/wp';

type GenreChipsProps = {
  genres: WPGenre[];
};

export default function GenreChips({ genres }: GenreChipsProps) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Browse by Genre
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Discover content by category
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map(genre => (
          <Link
            key={genre.id}
            href={`/search?genre=${genre.id}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
