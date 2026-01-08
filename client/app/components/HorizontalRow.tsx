import Link from 'next/link';
import PosterCard, { type PosterCardData } from './PosterCard';

type HorizontalRowProps = {
  title: string;
  seeAllHref: string;
  items: PosterCardData[];
  emptyMessage?: string;
};

export default function HorizontalRow({ title, seeAllHref, items, emptyMessage }: HorizontalRowProps) {
  if (items.length === 0) {
    return emptyMessage ? (
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/50 p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400">
          {emptyMessage}
        </div>
      </section>
    ) : null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <Link
          href={seeAllHref}
          className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          See all →
        </Link>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4">
          {items.map(item => (
            <PosterCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
