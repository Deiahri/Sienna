/**
 * Points on an image: `:::image{src=…}` wrapping a fenced JSON body.
 *
 *     :::image{src="https://…/ui.png" alt="Dashboard" caption="The new dashboard"}
 *     ```json
 *     { "pins": [ { "x": 42.5, "y": 31, "label": "Search", "description": "Searches every source." } ] }
 *     ```
 *     :::
 *
 * A LOCAL DEVIATION (2026-10-06 spike, Part 1): see README.md, "Known local deviations".
 *
 * `x` and `y` are percentages of the image's width and height, from its top-left corner, so a pin
 * stays on the same spot at any size. They are clamped to 0–100 when read rather than rejected: a
 * pin dragged a hair past the edge is still a pin. `label` and `description` are optional strings.
 *
 * Everything else is strict, the way `validateSpec` in `registry/graphs.ts` is: what this can't
 * represent is an error that names the fix, never something silently dropped. The editor relies on
 * that to keep a block it can't model as raw text instead of losing part of it.
 *
 * No imports, on purpose: the editor's headless tests load this file as it is.
 */

export interface ImagePin {
  /** Percent of the image's width, 0–100, from the left edge. */
  x: number;
  /** Percent of the image's height, 0–100, from the top edge. */
  y: number;
  label: string;
  description: string;
}

export type PinsResult = { pins: ImagePin[] } | { error: string };

const PIN_KEYS = ["x", "y", "label", "description"];

/** Names an author or a model reaches for instead of `pins`. */
const PINS_ALIASES = ["points", "markers", "tags", "hotspots", "annotations", "callouts"];

/** …and instead of a pin's own keys. A Map, so `constructor` and friends are never "found". */
const KEY_ALIASES = new Map([
  ["title", "label"],
  ["name", "label"],
  ["text", "description"],
  ["desc", "description"],
  ["body", "description"],
  ["left", "x"],
  ["top", "y"],
]);

/** A coordinate held to the image. */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Parses and checks a pins body. Returns an error *string* rather than throwing, so a bad body
 * degrades to a `DirectiveError` the way every other directive's failures do.
 */
export function validatePins(raw: string): PinsResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    return { error: `pins are not valid JSON (${error instanceof Error ? error.message : "parse failed"})` };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { error: "the body must be a JSON object with a `pins` array" };
  }
  const top = value as Record<string, unknown>;

  if (!Array.isArray(top.pins)) {
    const alias = PINS_ALIASES.find((key) => Object.hasOwn(top, key));
    return {
      error: alias
        ? `the body needs a \`pins\` array (found \`${alias}\` — did you mean \`pins\`?)`
        : "the body needs a `pins` array",
    };
  }
  const extra = Object.keys(top).find((key) => key !== "pins");
  if (extra) return { error: `unknown key \`${extra}\` beside \`pins\`` };

  const pins: ImagePin[] = [];
  for (const [i, item] of top.pins.entries()) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return { error: `pins[${i}] must be an object with \`x\`, \`y\`, \`label\` and \`description\`` };
    }
    const pin = item as Record<string, unknown>;

    for (const key of Object.keys(pin)) {
      if (PIN_KEYS.includes(key)) continue;
      const meant = KEY_ALIASES.get(key);
      return {
        error: meant
          ? `pins[${i}] has \`${key}\` — did you mean \`${meant}\`?`
          : `pins[${i}] has an unknown key \`${key}\` (a pin takes \`x\`, \`y\`, \`label\` and \`description\`)`,
      };
    }
    for (const axis of ["x", "y"] as const) {
      const n = pin[axis];
      if (typeof n !== "number" || !Number.isFinite(n)) {
        const side = axis === "x" ? "width" : "height";
        return { error: `pins[${i}].${axis} must be a number, the percent of the image's ${side} (found ${JSON.stringify(n ?? null)})` };
      }
    }
    for (const key of ["label", "description"] as const) {
      if (pin[key] !== undefined && typeof pin[key] !== "string") {
        return { error: `pins[${i}].${key} must be a string` };
      }
    }

    pins.push({
      x: clampPercent(pin.x as number),
      y: clampPercent(pin.y as number),
      label: (pin.label as string | undefined) ?? "",
      description: (pin.description as string | undefined) ?? "",
    });
  }
  return { pins };
}
