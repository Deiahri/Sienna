import {
  isDirectVideo,
  parseYouTube,
  safeUrl,
  youTubeEmbedUrl,
} from "../lib/url";
import { DirectiveError } from "./DirectiveError";

interface VideoProps {
  src?: string;
  title?: string;
  /** Start offset in seconds; overrides any `?t=` already on the URL. */
  t?: string;
}

/**
 * `::video{src="…"}` — YouTube links become an embed, everything else becomes
 * a native `<video>` player, per the spike requirements.
 *
 * Both paths are pure markup: the iframe and the video element need no
 * JavaScript from us, which is what keeps the renderer a server component.
 */
export function Video({ src, title, t }: VideoProps) {
  const url = safeUrl(src);
  if (!url) {
    return <DirectiveError message={`video: unusable src ${JSON.stringify(src ?? null)}`} />;
  }

  const youtube = parseYouTube(url);
  if (youtube) {
    const start = parseSeconds(t) ?? youtube.start;
    return (
      <figure className="md-video md-video--embed">
        <iframe
          className="md-video__frame"
          src={youTubeEmbedUrl(start === undefined ? youtube : { ...youtube, start })}
          title={title ?? "YouTube video player"}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {title ? <figcaption>{title}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className="md-video md-video--file">
      {/* Anything that isn't YouTube falls back to the browser's own player. */}
      <video className="md-video__player" src={url} controls preload="metadata" />
      {title ? <figcaption>{title}</figcaption> : null}
      {isDirectVideo(url) ? null : (
        <DirectiveError
          message={`video: ${url} is neither YouTube nor a recognised video file, so the native player may not play it`}
        />
      )}
    </figure>
  );
}

function parseSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}
