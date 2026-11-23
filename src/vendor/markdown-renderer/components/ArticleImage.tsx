import type { ReactNode } from "react";
import { cropStyles, parseCrop } from "../lib/imageCrop";
import { validatePins, type ImagePin } from "../lib/imagePins";
import { safeUrl } from "../lib/url";
import { DirectiveError } from "./DirectiveError";

interface ArticleImageProps {
  src?: string;
  alt?: string;
  caption?: string;
  /** Pins as raw JSON, lifted out of `:::image`'s fenced block by the directive plugin. */
  spec?: string;
  /** 2026-11-10 Part 5g: `x,y,w,h,ratio`, the part of the picture shown (lib/imageCrop.ts). */
  crop?: string;
  /**
   * Drawn over the image, inside the frame the pins are positioned in. Only an editor passes it
   * (its pin-placing layer); the published page never does.
   */
  overlay?: ReactNode;
}

/**
 * `::image{src="…" alt="…" caption="…"}` — the block form, wrapped in a
 * `<figure>` so it can carry a caption.
 *
 * `:::image{…}` around a ```json body puts numbered pins on it (2026-10-06 spike, Part 1, a local
 * deviation: see README.md). Each pin is a `<details>`: its number is the `<summary>`, and its label
 * and description open beside it on a click, a tap or Enter. They share a `name`, so opening one
 * closes the others. No JavaScript, so this stays a server component.
 *
 * 2026-10-22 Part 2d: the pins covered what they marked. The host's CSS now draws each as a small
 * ring until the image is hovered or focused, and opens a card on a click only, never on hover. A
 * "Hide pins" checkbox under the image takes them off (CSS again, through `:has`). Under it, not on
 * it: in a corner it covered the pins placed there.
 *
 * Without pins, the HTML is exactly what it always was.
 *
 * 2026-11-10 Part 5g, a local deviation: `crop` shows part of the picture, in a frame of that part's
 * shape (lib/imageCrop.ts). CSS only. Pins then sit on the part shown. A crop that doesn't read is
 * ignored: the whole picture shows.
 */
export function ArticleImage({ src, alt, caption, spec, crop: rawCrop, overlay }: ArticleImageProps) {
  const url = safeUrl(src);
  if (!url) {
    return <DirectiveError message={`image: unusable src ${JSON.stringify(src ?? null)}`} />;
  }

  const crop = parseCrop(rawCrop);
  const styles = crop ? cropStyles(crop) : null;
  // eslint-disable-next-line @next/next/no-img-element
  const image = <img src={url} alt={alt ?? ""} loading="lazy" decoding="async" style={styles?.image} />;
  const figcaption = caption ? <figcaption>{caption}</figcaption> : null;

  if (spec === undefined && overlay === undefined && !crop) {
    return (
      <figure className="md-image">
        {image}
        {figcaption}
      </figure>
    );
  }

  // An empty body is a plain image. A bad one is too, with a diagnostic, rather than no image.
  const result = spec === undefined || spec.trim() === "" ? { pins: [] } : validatePins(spec);
  const pins = "pins" in result ? result.pins : [];

  return (
    <figure className={`md-image${pins.length > 0 ? " md-image--pinned" : ""}${crop ? " md-image--cropped" : ""}`}>
      <div className="md-image__frame" style={styles?.frame}>
        {image}
        {pins.length > 0 && (
          <ol className="md-image__pins" aria-label="Points on this image">
            {pins.map((pin, i) => (
              <Pin key={i} pin={pin} n={i + 1} />
            ))}
          </ol>
        )}
        {overlay}
      </div>
      {pins.length > 0 && (
        <label className="md-image__toggle">
          <input type="checkbox" className="md-image__hide" />
          <span className="md-image__toggle-hide">Hide pins</span>
          <span className="md-image__toggle-show">Show pins</span>
        </label>
      )}
      {"error" in result ? <DirectiveError message={`image: ${result.error}`} /> : null}
      {figcaption}
    </figure>
  );
}

/**
 * One pin, centred on its point. Its card opens beside it (2026-10-22 Part 2d), on the side
 * `data-side` names: away from the image's centre, so the card covers the edge of the picture rather
 * than its subject, except near an edge, where it opens inward to stay on the image. `data-room` is
 * the side with more room, for a host to use where the image is too narrow for the first rule (a
 * phone). `data-v` lines the card up with the pin: its middle, or its top or bottom near an edge.
 */
function Pin({ pin, n }: { pin: ImagePin; n: number }) {
  const room = pin.x < 50 ? "right" : "left";
  const side = pin.x < 30 ? "right" : pin.x > 70 ? "left" : pin.x < 50 ? "left" : "right";
  const v = pin.y < 20 ? "top" : pin.y > 80 ? "bottom" : "middle";
  const hasCard = pin.label !== "" || pin.description !== "";
  return (
    <li className="md-pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} data-side={side} data-room={room} data-v={v}>
      <details className="md-pin__details" name="md-pins">
        <summary className="md-pin__dot" aria-label={pin.label || `Point ${n}`}>
          {n}
        </summary>
        {hasCard && (
          <div className="md-pin__card">
            {pin.label && <strong className="md-pin__label">{pin.label}</strong>}
            {pin.description && <span className="md-pin__desc">{pin.description}</span>}
          </div>
        )}
      </details>
    </li>
  );
}

/**
 * Plain markdown `![alt](src)`.
 *
 * Deliberately *not* wrapped in a `<figure>`: markdown puts a lone image inside
 * a paragraph, and `<p><figure></figure></p>` is invalid HTML that the browser
 * reparents, which would produce a hydration mismatch. Authors who want a
 * caption use the `::image` directive, which is block-level.
 */
export function InlineImage({ src, alt, title }: ArticleImageProps & { title?: string }) {
  const url = safeUrl(src);
  if (!url) return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className="md-inline-image"
      src={url}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
    />
  );
}
