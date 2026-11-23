/**
 * URL handling for author-supplied `src` values.
 *
 * Content is authored by trusted people, so this is defence in depth rather
 * than a security boundary. It costs almost nothing and means the pipeline is
 * already safe if untrusted markdown ever reaches it.
 */

/** Anything with a scheme, e.g. `https:`, `javascript:`, `data:`. */
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:"]);

/**
 * Browsers strip C0 controls and DEL before resolving a URL, which is how
 * `java<newline>script:alert(1)` sneaks past a naive prefix check. Strip them
 * first so the scheme test sees what the browser will see.
 */
function stripControlChars(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code > 31 && code !== 127) out += char;
  }
  return out;
}

/**
 * Returns a usable URL, or `undefined` if it should not be emitted.
 *
 * Absolute URLs must be http/https/mailto. Relative paths are allowed.
 * Everything else — `javascript:`, `data:`, `vbscript:` — is rejected.
 */
export function safeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const cleaned = stripControlChars(raw).trim();
  if (!cleaned) return undefined;

  // Protocol-relative (`//evil.com`) inherits the page scheme; treat it as a
  // scheme we didn't approve rather than as a relative path.
  if (cleaned.startsWith("//")) return undefined;

  if (HAS_SCHEME.test(cleaned)) {
    const scheme = cleaned.slice(0, cleaned.indexOf(":") + 1).toLowerCase();
    return ALLOWED_SCHEMES.has(scheme) ? cleaned : undefined;
  }

  return cleaned;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

/** An 11-character YouTube video id. */
const VIDEO_ID = /^[\w-]{11}$/;

export interface YouTubeRef {
  id: string;
  /** Start offset in seconds, from `?t=` / `?start=`. */
  start?: number;
}

/**
 * Extracts the video id from any of the shapes YouTube hands out:
 * `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`.
 * Returns `undefined` for non-YouTube URLs.
 */
export function parseYouTube(raw: string): YouTubeRef | undefined {
  let url: URL;
  try {
    url = new URL(raw, "https://placeholder.invalid");
  } catch {
    return undefined;
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return undefined;

  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;

  if (host.endsWith("youtu.be")) {
    id = segments[0];
  } else if (segments[0] === "watch") {
    id = url.searchParams.get("v") ?? undefined;
  } else if (
    segments[0] === "shorts" ||
    segments[0] === "embed" ||
    segments[0] === "live"
  ) {
    id = segments[1];
  }

  if (!id || !VIDEO_ID.test(id)) return undefined;

  const start = parseStart(
    url.searchParams.get("t") ?? url.searchParams.get("start"),
  );
  return start === undefined ? { id } : { id, start };
}

/** `?t=90` and `?t=90s` both mean ninety seconds. */
function parseStart(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

const VIDEO_FILE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i;

/** True when the URL points at a file a `<video>` element can play directly. */
export function isDirectVideo(url: string): boolean {
  return VIDEO_FILE.test(url);
}

/** Builds the privacy-enhanced embed URL for a YouTube video. */
export function youTubeEmbedUrl({ id, start }: YouTubeRef): string {
  const query = start ? `?start=${start}` : "";
  return `https://www.youtube-nocookie.com/embed/${id}${query}`;
}
