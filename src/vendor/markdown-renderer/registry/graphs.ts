/**
 * The chart vocabulary available to authors via `:::graph{type=…}`.
 *
 * Same principle as `registry/colors.ts` and `registry/icons.ts`: a closed
 * allowlist, not a passthrough. Authors — and the AI agents the spike asks
 * about — write `type=bar`, never an ECharts series name, and name a colour
 * token, never a hex value. That keeps the surface small enough to validate
 * exhaustively and keeps the underlying library swappable: only
 * `lib/graphOption.ts` knows ECharts exists.
 *
 * Eleven types rather than the seven the Chart.js run exposed. The four
 * additions are the ones Chart.js has no native controller for, so each is
 * capability the extra bytes actually bought rather than a repackaging of
 * something that already worked. `radar` was deliberately left out on the same
 * reasoning in reverse: Chart.js ships it natively, so adding it here would
 * demonstrate nothing about the library change.
 *
 * Adding a type is one entry here, one case in `buildOption`, and one named
 * import in `lib/echartsClient.ts`.
 */
export const GRAPH_TYPES = [
  "bar",
  "hbar",
  "line",
  "area",
  "scatter",
  "pie",
  "donut",
  // ECharts-only, relative to Chart.js's eight native controllers.
  "funnel",
  "treemap",
  "gauge",
  "heatmap",
] as const;

export type GraphType = (typeof GRAPH_TYPES)[number];

const TYPE_SET: ReadonlySet<string> = new Set(GRAPH_TYPES);

export function isGraphType(value: unknown): value is GraphType {
  return typeof value === "string" && TYPE_SET.has(value);
}

/** One plotted series. `color` is a colour *token*, resolved to a CSS variable. */
export interface GraphSeries {
  label?: string;
  /** A `registry/colors.ts` token name. Anything else is ignored, not rendered. */
  color?: string;
  /**
   * Numbers for most types; `[x, y]` pairs for scatter; `[col, row, value]`
   * triples for heatmap. `gauge` takes exactly one number.
   */
  data: Array<number | [number, number] | [number, number, number]>;
}

/** The author-facing shape carried in the directive's fenced JSON body. */
export interface GraphSpec {
  /** Category labels (bar/hbar/line/area/heatmap columns) or slice labels (pie/donut/funnel/treemap). */
  x?: string[];
  /** Row labels. Heatmap only, and required there. */
  y?: string[];
  /** Full-scale value for `gauge`. Defaults to 100. */
  max?: number;
  series: GraphSeries[];
}

/**
 * Keys an agent plausibly reaches for instead of the real ones. Naming them in
 * the error turns a generic "needs `series`" into an actionable correction,
 * which is the difference between an agent fixing its own output on the next
 * turn and looping.
 */
// `y` was a series alias in the Chart.js run. It is a real field now — heatmap
// row labels — so suggesting it would send a heatmap author the wrong way.
const SERIES_ALIASES = ["data", "datasets", "values", "plots"];
const X_ALIASES = ["labels", "categories", "xAxis"];
const Y_ALIASES = ["rows", "yLabels", "rowLabels", "yAxis"];

type ValidationResult = { spec: GraphSpec } | { error: string };

/**
 * Validates a parsed JSON body against the type the directive declared.
 *
 * The `type` argument is new in this run and it is what lets the error say
 * "heatmap needs a `y` array of row labels" rather than restating the generic
 * schema. Four of the eleven types have requirements the other seven do not,
 * and a validator that cannot see the type cannot mention them — which matters
 * most for the agent case, where the error message *is* the documentation.
 *
 * Returns an error *string* rather than throwing, so a bad spec degrades to a
 * `DirectiveError` exactly the way every other directive's failures do — loud
 * in development, invisible in production.
 */
export function validateSpec(value: unknown, type?: GraphType): ValidationResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { error: "spec must be a JSON object" };
  }
  const raw = value as Record<string, unknown>;

  if (!Array.isArray(raw.series)) {
    const alias = SERIES_ALIASES.find((k) => k in raw);
    return {
      error: alias
        ? `spec needs a \`series\` array (found \`${alias}\` — did you mean \`series\`?)`
        : "spec needs a `series` array",
    };
  }
  if (raw.series.length === 0) {
    return { error: "`series` is empty, so there is nothing to plot" };
  }

  let x: string[] | undefined;
  if (raw.x !== undefined) {
    if (!Array.isArray(raw.x) || !raw.x.every((label) => typeof label === "string")) {
      return { error: "`x` must be an array of label strings" };
    }
    x = raw.x as string[];
  } else {
    const alias = X_ALIASES.find((k) => k in raw);
    if (alias) return { error: `found \`${alias}\` — category labels go in \`x\`` };
  }

  let y: string[] | undefined;
  if (raw.y !== undefined) {
    if (!Array.isArray(raw.y) || !raw.y.every((label) => typeof label === "string")) {
      return { error: "`y` must be an array of row-label strings" };
    }
    y = raw.y as string[];
  }

  let max: number | undefined;
  if (raw.max !== undefined) {
    if (typeof raw.max !== "number" || !Number.isFinite(raw.max) || raw.max <= 0) {
      return { error: "`max` must be a positive number" };
    }
    max = raw.max;
  }

  const series: GraphSeries[] = [];
  for (const [index, entry] of raw.series.entries()) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return { error: `series[${index}] must be an object with a \`data\` array` };
    }
    const s = entry as Record<string, unknown>;

    if (!Array.isArray(s.data)) {
      return { error: `series[${index}] needs a \`data\` array` };
    }
    const bad = s.data.findIndex((d) => !isDatum(d));
    if (bad !== -1) {
      return {
        error:
          `series[${index}].data[${bad}] is ${JSON.stringify(s.data[bad])} — ` +
          "data must be numbers, [x, y] number pairs for scatter, " +
          "or [column, row, value] triples for heatmap",
      };
    }

    series.push({
      label: typeof s.label === "string" ? s.label : undefined,
      color: typeof s.color === "string" ? s.color : undefined,
      data: s.data as GraphSeries["data"],
    });
  }

  const spec: GraphSpec = { x, y, max, series };
  const typeError = type && checkForType(type, spec, raw);
  return typeError ? { error: typeError } : { spec };
}

/**
 * The per-type requirements, kept out of the generic pass above so the shape of
 * the common case stays readable.
 *
 * Every message here names the fix rather than the rule. `heatmap` is the one
 * with real structure to get wrong, and it gets the most specific errors.
 */
function checkForType(
  type: GraphType,
  spec: GraphSpec,
  raw: Record<string, unknown>,
): string | undefined {
  if (type === "gauge") {
    if (spec.series.length > 1) {
      return "gauge plots a single number, so it takes one series — " +
        `found ${spec.series.length}`;
    }
    const data = spec.series[0].data;
    if (data.length !== 1 || typeof data[0] !== "number") {
      return "gauge needs exactly one number in `series[0].data`, " +
        "e.g. `\"series\": [{ \"data\": [72] }]` — set the full-scale value with `max`";
    }
    return undefined;
  }

  if (type === "heatmap") {
    if (!spec.y) {
      const alias = Y_ALIASES.find((k) => k in raw);
      return alias
        ? `heatmap needs a \`y\` array of row labels (found \`${alias}\` — did you mean \`y\`?)`
        : "heatmap needs a `y` array of row labels, alongside `x` for the columns";
    }
    if (!spec.x) {
      return "heatmap needs an `x` array of column labels, alongside `y` for the rows";
    }
    for (const [index, s] of spec.series.entries()) {
      const bad = s.data.findIndex((d) => !Array.isArray(d) || d.length !== 3);
      if (bad !== -1) {
        return `series[${index}].data[${bad}] is not a [column, row, value] triple — ` +
          "heatmap cells are indexed into `x` and `y`, e.g. `[0, 2, 41]`";
      }
      const out = (s.data as Array<[number, number, number]>).findIndex(
        ([col, row]) => col >= spec.x!.length || row >= spec.y!.length || col < 0 || row < 0,
      );
      if (out !== -1) {
        const [col, row] = s.data[out] as [number, number, number];
        return `series[${index}].data[${out}] points at [${col}, ${row}], ` +
          `outside the ${spec.x!.length}×${spec.y!.length} grid \`x\` and \`y\` describe`;
      }
    }
    return undefined;
  }

  if (type === "scatter") {
    for (const [index, s] of spec.series.entries()) {
      const bad = s.data.findIndex((d) => !Array.isArray(d) || d.length !== 2);
      if (bad !== -1) {
        return `series[${index}].data[${bad}] is not an [x, y] pair — ` +
          "scatter points need both coordinates";
      }
    }
    return undefined;
  }

  // pie, donut, funnel and treemap each plot one series of numbers; a second
  // one is silently dropped by every library, which is worse than saying so.
  if (type === "pie" || type === "donut" || type === "funnel" || type === "treemap") {
    if (spec.series.length > 1) {
      return `${type} plots a single series of numbers — found ${spec.series.length}. ` +
        "Each entry in `series[0].data` becomes one slice, labelled from `x`";
    }
  }

  for (const [index, s] of spec.series.entries()) {
    const bad = s.data.findIndex((d) => typeof d !== "number");
    if (bad !== -1) {
      return `series[${index}].data[${bad}] is ${JSON.stringify(s.data[bad])} — ` +
        `${type} plots plain numbers`;
    }
  }
  return undefined;
}

function isDatum(
  value: unknown,
): value is number | [number, number] | [number, number, number] {
  if (typeof value === "number") return Number.isFinite(value);
  return (
    Array.isArray(value) &&
    (value.length === 2 || value.length === 3) &&
    value.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}
