/**
 * A crop on an image: `::image{src=… crop="x,y,w,h,ratio"}`.
 *
 * A LOCAL DEVIATION (2026-11-10, Part 5g): see README.md, "Known local deviations". Junda: "Images
 * are ASS. I have to frame them, circle, highlight… crop controls or something should be added."
 *
 * `x`, `y`, `w` and `h` are percentages of the image's width and height: the kept part's top-left
 * corner and its size. `ratio` is that part's width over its height in pixels, which the picture
 * itself only knows once loaded: it lets the page size the frame before the image arrives, with no
 * JavaScript, so this stays a server component. The file is never touched: a crop is undone by
 * taking the attribute off.
 *
 * Pins on a cropped image are percentages of the kept part, not of the whole picture.
 *
 * No imports, on purpose: the editor's headless tests load this file as it is.
 */

export interface ImageCrop {
  x: number;
  y: number;
  w: number;
  h: number;
  /** The kept part's width over its height, in pixels. */
  ratio: number;
}

/** Smaller than this, in percent, and it's not a crop anyone meant. */
const MIN = 2;

const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places;

/** A crop attribute, or null when there is none or it makes no sense: an image is never hidden by a bad crop. */
export function parseCrop(raw: string | undefined | null): ImageCrop | null {
  if (!raw) return null;
  const parts = raw.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 5 || parts.some((n) => !Number.isFinite(n))) return null;
  const [x, y, w, h, ratio] = parts;
  if (x < 0 || y < 0 || w < MIN || h < MIN || x + w > 100.05 || y + h > 100.05 || ratio <= 0) return null;
  // The whole picture is no crop at all.
  if (x <= 0.05 && y <= 0.05 && w >= 99.95 && h >= 99.95) return null;
  return { x, y, w: Math.min(w, 100 - x), h: Math.min(h, 100 - y), ratio };
}

/** The attribute for a crop: a tenth of a percent is finer than a pixel on any picture a doc holds. */
export function writeCrop(crop: ImageCrop): string {
  return [round(crop.x, 1), round(crop.y, 1), round(crop.w, 1), round(crop.h, 1), round(crop.ratio, 4)].join(",");
}

/**
 * The frame's and the image's styles. The frame has the kept part's shape and hides the rest; the
 * image inside is scaled so the kept part fills it, and moved so it shows. Percentages of the frame
 * throughout, so it holds at any width.
 */
export function cropStyles(crop: ImageCrop): { frame: Record<string, string | number>; image: Record<string, string | number> } {
  return {
    // `--md-crop-ratio` lets a host cap the frame's height without breaking its shape.
    frame: { position: "relative", overflow: "hidden", aspectRatio: String(crop.ratio), "--md-crop-ratio": String(crop.ratio) },
    image: {
      position: "absolute",
      maxWidth: "none",
      width: `${round((100 / crop.w) * 100, 4)}%`,
      height: `${round((100 / crop.h) * 100, 4)}%`,
      left: `${round((-crop.x / crop.w) * 100, 4)}%`,
      top: `${round((-crop.y / crop.h) * 100, 4)}%`,
    },
  };
}

/** A point on the whole picture, in percent, as a point on the kept part; null when it's cut away. */
export function intoCrop(point: { x: number; y: number }, crop: ImageCrop | null): { x: number; y: number } | null {
  if (!crop) return point;
  const x = ((point.x - crop.x) / crop.w) * 100;
  const y = ((point.y - crop.y) / crop.h) * 100;
  return x < 0 || y < 0 || x > 100 || y > 100 ? null : { x, y };
}

/** A point on the kept part, in percent, as a point on the whole picture. */
export function outOfCrop(point: { x: number; y: number }, crop: ImageCrop | null): { x: number; y: number } {
  if (!crop) return point;
  return { x: crop.x + (point.x * crop.w) / 100, y: crop.y + (point.y * crop.h) / 100 };
}
