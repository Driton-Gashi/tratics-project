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
    <section className="relative -mx-4 overflow-hidden rounded-2xl sm:mx-0">
      <div className="relative aspect-[16/9] w-full bg-slate-900 sm:aspect-[21/9]">
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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{item.title}</div>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-8 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16">
            <div className="mx-auto max-w-4xl">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl">
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
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/90 sm:text-base sm:line-clamp-3">
                    {item.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={item.href}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
                  >
                    Watch Now
                  </Link>
                  <Link
                    href={item.type === 'movie' ? '/movies' : '/series'}
                    className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
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
