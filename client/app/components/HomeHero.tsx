import Link from 'next/link';

export type HomeHeroData = {
  type: 'movie' | 'series';
  title: string;
  excerpt?: string;
  year?: number;
  rating?: number;
  posterUrl?: string | null;
  href: string;
};

export default function HomeHero({ item }: { item: HomeHeroData }) {
  const poster = typeof item.posterUrl === 'string' ? item.posterUrl.trim() : '';

  return (
    <section className="relative -mx-4 overflow-hidden rounded-none sm:mx-0 md:rounded-2xl">
      <div className="relative aspect-4/5 w-full bg-slate-900 sm:aspect-[16/9] lg:aspect-[21/9]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{item.title}</div>
            </div>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/15 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end lg:items-center">
          <div className="w-full px-4 pb-8 md:pt-12 sm:px-8 sm:pb-8 lg:px-12 lg:pb-10">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl lg:max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
                    Featured
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
                    {item.type === 'movie' ? 'Movie' : 'Series'}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl lg:text-4xl">
                  {item.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {item.year && (
                    <span className="text-sm font-medium text-white/90">{item.year}</span>
                  )}
                  {typeof item.rating === 'number' && (
                    <>
                      <span className="text-white/50">•</span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                        ⭐ {item.rating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>

                {item.excerpt && (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/90 sm:text-base">
                    {item.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={item.href}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-white/90 sm:w-auto"
                  >
                    Watch Now
                  </Link>

                  <Link
                    href={item.type === 'movie' ? '/movies' : '/series'}
                    className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
                  >
                    Browse {item.type === 'movie' ? 'Movies' : 'Series'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
