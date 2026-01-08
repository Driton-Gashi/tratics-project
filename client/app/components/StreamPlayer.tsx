import {
  getStreamType,
  getStreamUrl,
  getStreamIframe,
  getStreamProvider,
  sanitizeAndValidateIframe,
} from '@/lib/wp';

type StreamPlayerProps = {
  streamType: 'iframe' | 'external' | 'none';
  streamUrl?: string | null;
  streamIframe?: string | null;
  streamProvider?: string | null;
};

export default function StreamPlayer({
  streamType,
  streamUrl,
  streamIframe,
  streamProvider,
}: StreamPlayerProps) {
  if (streamType === 'iframe' && streamIframe) {
    const safeIframe = sanitizeAndValidateIframe(streamIframe);
    if (safeIframe) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <div
            className="absolute inset-0"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: safeIframe }}
          />
          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
                .aspect-video iframe {
                  width: 100%;
                  height: 100%;
                }
              `,
            }}
          />
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-black/10 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-700/50 dark:text-slate-300">
        This embed is missing or not allowed. Add a YouTube/Vimeo iframe in WordPress.
      </div>
    );
  }

  if (streamType === 'external' && streamUrl) {
    const provider = streamProvider || 'external provider';
    return (
      <a
        href={streamUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        Watch on {provider}
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-700/50 dark:text-slate-300">
      No stream available
    </div>
  );
}

export function createStreamPlayerProps(item: {
  acf?: {
    stream_type?: string;
    stream_url?: string;
    stream_iframe?: string;
    stream_provider?: string;
  };
}): StreamPlayerProps {
  return {
    streamType: getStreamType(item),
    streamUrl: getStreamUrl(item),
    streamIframe: getStreamIframe(item),
    streamProvider: getStreamProvider(item),
  };
}
