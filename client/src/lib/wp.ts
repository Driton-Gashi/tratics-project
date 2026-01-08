const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL || 'https://tratics.dritongashi.com';
const WP_MOVIE_REST_BASE = process.env.NEXT_PUBLIC_WP_MOVIE_REST_BASE || 'movies';
const WP_SERIES_REST_BASE = process.env.NEXT_PUBLIC_WP_SERIES_REST_BASE || 'series';
const WP_EPISODE_REST_BASE = process.env.NEXT_PUBLIC_WP_EPISODE_REST_BASE || 'episodes';

// ============================================================================
// TYPES
// ============================================================================

export type WPMediaDetails = {
  id: number;
  source_url: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width?: number; height?: number }>;
  };
};

export type WPMovieACF = {
  release_year?: string | number;
  runtime_minutes?: number;
  imdb_rating?: number;
  trailer_url?: string;
  stream_type?: 'iframe' | 'external' | 'none';
  stream_url?: string;
  stream_iframe?: string;
  stream_provider?: string;
  [key: string]: unknown;
};

export type WPMovie = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  acf?: WPMovieACF;
  featured_media?: number;
  genre?: number[];
};

export type WPSeriesACF = {
  [key: string]: unknown;
};

export type WPSeries = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  acf?: WPSeriesACF;
  featured_media?: number;
  genre?: number[];
};

export type WPEpisodeACF = {
  series?: number;
  season_number?: number;
  episode_number?: number;
  runtime_minutes?: number;
  air_date?: string; // Format: "YYYYMMDD"
  stream_type?: 'iframe' | 'external' | 'none';
  stream_url?: string;
  stream_iframe?: string;
  stream_provider?: string;
  [key: string]: unknown;
};

export type WPEpisode = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  acf?: WPEpisodeACF;
  featured_media?: number;
};

export type WPGenre = {
  id: number;
  name: string;
  slug: string;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function getTitleText(item: { title?: { rendered?: string } }): string {
  return stripHtml(item.title?.rendered ?? '');
}

export function getExcerptText(item: { excerpt?: { rendered?: string } }): string {
  return stripHtml(item.excerpt?.rendered ?? '');
}

export function getReleaseYear(item: { acf?: { release_year?: string | number } }): number {
  const year = item.acf?.release_year;

  if (typeof year === 'number' && Number.isFinite(year)) return year;

  if (typeof year === 'string') {
    const parsed = Number(year);
    if (Number.isFinite(parsed)) return parsed;
  }

  return new Date().getFullYear();
}

export function getRating(item: { acf?: { imdb_rating?: number } }): number | undefined {
  const rating = item.acf?.imdb_rating;
  if (typeof rating !== 'number') return undefined;
  if (rating < 0 || rating > 10) return undefined;
  return rating;
}

export function getRuntime(item: { acf?: { runtime_minutes?: number } }): number | null {
  const v = item.acf?.runtime_minutes;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export function getTrailerUrl(item: { acf?: { trailer_url?: string } }): string | null {
  const url = typeof item.acf?.trailer_url === 'string' ? item.acf.trailer_url.trim() : '';
  return url ? url : null;
}

export function getStreamType(
  item: { acf?: { stream_type?: string } }
): 'iframe' | 'external' | 'none' {
  const t = item.acf?.stream_type;
  if (t === 'iframe' || t === 'external') return t;
  return 'none';
}

export function getStreamUrl(item: { acf?: { stream_url?: string } }): string | null {
  const url = typeof item.acf?.stream_url === 'string' ? item.acf.stream_url.trim() : '';
  return url ? url : null;
}

export function getStreamIframe(item: { acf?: { stream_iframe?: string } }): string | null {
  const html = typeof item.acf?.stream_iframe === 'string' ? item.acf.stream_iframe.trim() : '';
  return html ? html : null;
}

export function getStreamProvider(item: { acf?: { stream_provider?: string } }): string | null {
  const provider = typeof item.acf?.stream_provider === 'string' ? item.acf.stream_provider.trim() : '';
  return provider ? provider : null;
}

// ============================================================================
// MEDIA FETCHING
// ============================================================================

const mediaCache = new Map<number, WPMediaDetails>();

export async function wpFetchMedia(mediaId: number): Promise<WPMediaDetails | null> {
  if (!mediaId || mediaId <= 0) return null;

  // Check cache
  const cached = mediaCache.get(mediaId);
  if (cached) return cached;

  const url = `${WP_BASE_URL}/wp-json/wp/v2/media/${mediaId}?_fields=id,source_url,media_details`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    return null;
  }

  const media = (await res.json()) as WPMediaDetails;
  mediaCache.set(mediaId, media);
  return media;
}

export function getMediaUrl(media: WPMediaDetails | null): string | null {
  if (!media) return null;

  const sizes = media.media_details?.sizes;

  return (
    sizes?.medium_large?.source_url ??
    sizes?.large?.source_url ??
    sizes?.medium?.source_url ??
    media.source_url ??
    null
  );
}

export async function getPosterUrl(mediaId?: number): Promise<string | null> {
  if (!mediaId) return null;
  const media = await wpFetchMedia(mediaId);
  return getMediaUrl(media);
}

// ============================================================================
// GENRE FETCHING
// ============================================================================

export async function wpFetchGenres(genreIds: number[]): Promise<WPGenre[]> {
  if (!genreIds.length) return [];

  const include = genreIds.join(',');
  const url = `${WP_BASE_URL}/wp-json/wp/v2/genre?include=${include}&_fields=id,name,slug`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    return [];
  }

  return (await res.json()) as WPGenre[];
}

export function getGenreNames(genres: WPGenre[]): string[] {
  return genres.map(g => g.name);
}

// ============================================================================
// MOVIES
// ============================================================================

export async function wpFetchMovies(params?: {
  q?: string;
  page?: number;
  perPage?: number;
}): Promise<{ data: WPMovie[]; totalPages: number }> {
  const url = new URL(`${WP_BASE_URL}/wp-json/wp/v2/${WP_MOVIE_REST_BASE}`);

  url.searchParams.set('_fields', 'id,slug,title,excerpt,acf,featured_media,genre');
  url.searchParams.set('per_page', String(params?.perPage ?? 12));
  url.searchParams.set('page', String(params?.page ?? 1));

  const q = params?.q?.trim();
  if (q) url.searchParams.set('search', q);

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP API error: ${res.status} ${text}`);
  }

  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? '0');
  const data = (await res.json()) as WPMovie[];

  return { data, totalPages };
}

export async function wpFetchMovieBySlug(slug: string | undefined | null): Promise<WPMovie | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const cleanSlug = slug.trim();
  if (!cleanSlug) {
    return null;
  }

  const url = new URL(`${WP_BASE_URL}/wp-json/wp/v2/${WP_MOVIE_REST_BASE}`);
  url.searchParams.set('slug', cleanSlug);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('_fields', 'id,slug,title,content,excerpt,acf,featured_media,genre');

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as WPMovie[];

  return data[0] ?? null;
}

// ============================================================================
// SERIES
// ============================================================================

export async function wpFetchSeries(params?: {
  q?: string;
  page?: number;
  perPage?: number;
}): Promise<{ data: WPSeries[]; totalPages: number }> {
  const url = new URL(`${WP_BASE_URL}/wp-json/wp/v2/${WP_SERIES_REST_BASE}`);

  url.searchParams.set('_fields', 'id,slug,title,excerpt,acf,featured_media,genre');
  url.searchParams.set('per_page', String(params?.perPage ?? 12));
  url.searchParams.set('page', String(params?.page ?? 1));

  const q = params?.q?.trim();
  if (q) url.searchParams.set('search', q);

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP API error: ${res.status} ${text}`);
  }

  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? '0');
  const data = (await res.json()) as WPSeries[];

  return { data, totalPages };
}

export async function wpFetchSeriesBySlug(
  slug: string | undefined | null
): Promise<WPSeries | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const cleanSlug = slug.trim();
  if (!cleanSlug) {
    return null;
  }

  const url = new URL(`${WP_BASE_URL}/wp-json/wp/v2/${WP_SERIES_REST_BASE}`);
  url.searchParams.set('slug', cleanSlug);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('_fields', 'id,slug,title,content,excerpt,acf,featured_media,genre');

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as WPSeries[];

  return data[0] ?? null;
}

export async function wpFetchSeriesById(seriesId: number): Promise<WPSeries | null> {
  if (!seriesId || seriesId <= 0) {
    return null;
  }

  const url = `${WP_BASE_URL}/wp-json/wp/v2/${WP_SERIES_REST_BASE}/${seriesId}?_fields=id,slug,title,content,excerpt,acf,featured_media,genre`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as WPSeries;
}

// ============================================================================
// EPISODES
// ============================================================================

export async function wpFetchEpisodes(): Promise<WPEpisode[]> {
  const url = new URL(`${WP_BASE_URL}/wp-json/wp/v2/${WP_EPISODE_REST_BASE}`);
  url.searchParams.set('per_page', '100');
  url.searchParams.set('_fields', 'id,slug,title,excerpt,acf,featured_media');

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP API error: ${res.status} ${text}`);
  }

  return (await res.json()) as WPEpisode[];
}

export function filterEpisodesBySeries(episodes: WPEpisode[], seriesId: number): WPEpisode[] {
  return episodes.filter(e => e.acf?.series === seriesId);
}

export function sortEpisodes(episodes: WPEpisode[]): WPEpisode[] {
  return [...episodes].sort((a, b) => {
    const seasonA = a.acf?.season_number ?? 0;
    const seasonB = b.acf?.season_number ?? 0;
    if (seasonA !== seasonB) return seasonA - seasonB;

    const episodeA = a.acf?.episode_number ?? 0;
    const episodeB = b.acf?.episode_number ?? 0;
    return episodeA - episodeB;
  });
}

export function groupEpisodesBySeason(episodes: WPEpisode[]): Map<number, WPEpisode[]> {
  const grouped = new Map<number, WPEpisode[]>();

  for (const episode of episodes) {
    const season = episode.acf?.season_number ?? 1;
    if (!grouped.has(season)) {
      grouped.set(season, []);
    }
    grouped.get(season)!.push(episode);
  }

  return grouped;
}

// ============================================================================
// IFRAME SANITIZATION
// ============================================================================

const ALLOWED_IFRAME_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
  'vimeo.com',
]);

export function sanitizeAndValidateIframe(iframeHtml: string): string | null {
  const match = iframeHtml.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i);
  const src = match?.[1] ?? null;
  if (!src) return null;

  let host = '';
  try {
    host = new URL(src).host;
  } catch {
    return null;
  }

  if (!ALLOWED_IFRAME_HOSTS.has(host)) return null;

  const safe = `<iframe
    src="${src}"
    title="Video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>`;

  return safe;
}
