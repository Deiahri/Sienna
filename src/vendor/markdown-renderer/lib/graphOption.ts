import { isColorToken } from "../registry/colors";
import type { GraphSpec, GraphType } from "../registry/graphs";

/**
 * Turns a validated `GraphSpec` into an ECharts option object.
 *
 * This is the only file in the renderer that knows which chart library is in
 * use. Everything upstream — the directive, the registry, the author's JSON —
 * is library-neutral, so swapping ECharts out means rewriting this file and
 * `lib/echartsClient.ts` and nothing else.
 *
 * **The rule that matters: no literal colour is ever emitted.** Every colour is
 * a `var(--md-…)` reference to a custom property `article.css` already defines.
 * ECharts' SVG renderer writes that string straight into the `fill` attribute,
 * so the browser's cascade resolves it at paint time and a light→dark switch
 * costs zero JavaScript.
 *
 * Note the signature: `(type, spec)`, with no theme argument. The Chart.js
 * version of this file took a third `theme` parameter, because canvas pixels
 * are outside the cascade and every token had to be resolved to a literal
 * before the draw and re-resolved on every theme change. That parameter, the
 * 95-line bridge behind it, and its silent failure mode are all gone. A test
 * walks this function's entire output and asserts every colour still matches
 * `var(--md-…)`; that assertion is what replaces the bridge.
 *
 * ---
 *
 * **The one trap in this strategy, and it bites on hover.** ECharts is happy to
 * *pass* an unrecognised colour through to the SVG, but not to *derive* one from
 * it. Left to itself it renders a hover state by lightening the mark's own
 * colour — `liftColor` → `lift` → `parse("var(--md-…)")` returns null, and `lift`
 * then falls off the end of the function and returns `undefined`. The hovered
 * mark loses its fill and vanishes, and the result is memoised, so it vanishes
 * every time after that.
 *
 * The rule that follows: **every series must set an explicit `emphasis` fill.**
 * `states.js` only derives one when none was given (`hasFillOrStroke(emphasisStyle.fill)`),
 * so supplying one skips the parse entirely. Same for anything else ECharts
 * would compute rather than copy. `graph-spike/probes/zero-js.mjs` hovers each
 * type and checks it, because no amount of reading the resting-state output
 * catches this.
 */

/** Palette used, in order, when a series names no colour of its own. */
const DEFAULT_TOKENS = ["primary", "secondary", "accent", "success", "warning", "danger"] as const;

function cssColor(token: string | undefined, index: number): string {
  const name = isColorToken(token) ? token : DEFAULT_TOKENS[index % DEFAULT_TOKENS.length];
  return `var(--md-color-${name})`;
}

/** Structural colours pull from the article's tokens too, never hardcoded greys. */
const AXIS = {
  axisLine: { lineStyle: { color: "var(--md-border)" } },
  axisTick: { lineStyle: { color: "var(--md-border)" } },
  axisLabel: { color: "var(--md-muted)" },
  splitLine: { lineStyle: { color: "var(--md-border)" } },
} as const;

/**
 * The tooltip is a DOM element rather than part of the SVG, so it takes the
 * same treatment: custom properties in, cascade resolves them out. Without this
 * ECharts applies its own hardcoded light background, which is the one part of
 * the chart that would otherwise ignore dark mode.
 */
const TOOLTIP = {
  backgroundColor: "var(--md-surface)",
  borderColor: "var(--md-border)",
  textStyle: { color: "var(--md-fg)" },
  // Even the shadow is a token. A literal here would be the one colour in the
  // option that a dark palette could not reach — and `extraCssText` is a raw
  // CSS string, so it is exactly where one would go unnoticed.
  extraCssText: "box-shadow: 0 2px 12px var(--md-shadow);",
} as const;

/**
 * The crosshair and the band behind a hovered category.
 *
 * Hover-only, which is exactly why it was missed: ECharts' defaults come from
 * its own token set (`tokens.color.border`, `tokens.color.shadowTint`) and
 * resolve to hex literals, so without this the pointer stays a light-theme grey
 * in dark mode. Nothing at rest reveals it.
 */
const AXIS_POINTER = {
  lineStyle: { color: "var(--md-border)" },
  crossStyle: { color: "var(--md-border)" },
  shadowStyle: { color: "var(--md-surface)" },
} as const;

/**
 * The hover state for one mark.
 *
 * Keeps the mark's own colour and adds an outline, rather than letting ECharts
 * lighten it — see the note at the top of this file. `color` is the load-bearing
 * half: its presence is what stops `liftColor` running. The border is the part a
 * reader actually sees.
 */
function emphasisFor(color: string) {
  return {
    itemStyle: { color, borderColor: "var(--md-fg)", borderWidth: 2 },
  };
}

export function buildOption(type: GraphType, spec: GraphSpec): Record<string, unknown> {
  const categories = spec.x ?? [];
  const labelled = spec.series.length > 1 || spec.series.some((s) => s.label);

  const legend = labelled
    ? {
        show: true,
        // `roundRect` rather than the per-series default. ECharts' line-series
        // legend marker is an open circle whose centre it fills with a literal
        // `#fff`, which is the one mark in the chart that would not follow the
        // palette into dark mode. A plain swatch takes the series colour and
        // carries no literal at all.
        icon: "roundRect",
        itemWidth: 14,
        itemHeight: 9,
        textStyle: { color: "var(--md-muted)" },
        bottom: 0,
      }
    : { show: false };

  // Unlike the server-rendered run, animation stays on: the chart is drawn in
  // the browser, so there is a first frame to animate from. `GraphClient`
  // turns it off when the reader has asked for reduced motion.
  const base = { animation: true, legend };

  if (type === "pie" || type === "donut") {
    // Pie and donut differ only in inner radius. Slices are one series, so the
    // per-slice colour comes from position, not from `series.color`.
    const values = numbers(spec);
    return {
      ...base,
      tooltip: { trigger: "item", ...TOOLTIP },
      series: [
        {
          type: "pie",
          radius: type === "donut" ? ["45%", "70%"] : "70%",
          center: ["50%", labelled ? "45%" : "50%"],
          label: { color: "var(--md-fg)" },
          labelLine: { lineStyle: { color: "var(--md-border)" } },
          // Emphasis is per-item here, not per-series: every slice has its own
          // colour, so a single series-level emphasis fill would recolour
          // whichever slice was hovered.
          data: values.map((value, i) => ({
            name: categories[i] ?? `#${i + 1}`,
            value,
            itemStyle: { color: cssColor(undefined, i) },
            emphasis: emphasisFor(cssColor(undefined, i)),
          })),
        },
      ],
    };
  }

  if (type === "funnel") {
    // Funnel is pie's shape with a different geometry: one series, one slice
    // per number, labels from `x`. ECharts sorts descending by default, which
    // is what a funnel means, so the author's order is not preserved.
    const values = numbers(spec);
    return {
      ...base,
      tooltip: { trigger: "item", ...TOOLTIP },
      series: [
        {
          type: "funnel",
          left: "10%",
          right: "10%",
          top: 16,
          bottom: labelled ? 40 : 16,
          minSize: "16%",
          // --md-surface, not --md-fg: these sit INSIDE the slices, on the
          // series palette. On a host whose `primary` token is near-black the
          // ink version is invisible (measured 1:1), and it fails contrast on
          // every other slot too. Matches the treemap branch below, which is
          // the only other type that paints a label on top of its own mark.
          label: { color: "var(--md-surface)", position: "inside" },
          labelLine: { lineStyle: { color: "var(--md-border)" } },
          data: values.map((value, i) => ({
            name: categories[i] ?? `#${i + 1}`,
            value,
            itemStyle: { color: cssColor(undefined, i), borderColor: "var(--md-surface)" },
            emphasis: emphasisFor(cssColor(undefined, i)),
          })),
        },
      ],
    };
  }

  if (type === "treemap") {
    // Flat treemap: one rectangle per number, sized by value. ECharts would
    // normally colour these from its own built-in palette of literals, so
    // `colorMappingBy` is turned off in favour of explicit per-node colours —
    // otherwise this is the one type that would ignore the article's tokens.
    const values = numbers(spec);
    return {
      ...base,
      tooltip: { trigger: "item", ...TOOLTIP },
      series: [
        {
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          top: 8,
          bottom: labelled ? 40 : 8,
          left: 8,
          right: 8,
          label: { color: "var(--md-surface)" },
          itemStyle: { borderColor: "var(--md-surface)", borderWidth: 2, gapWidth: 2 },
          data: values.map((value, i) => ({
            name: categories[i] ?? `#${i + 1}`,
            value,
            itemStyle: { color: cssColor(undefined, i) },
            emphasis: emphasisFor(cssColor(undefined, i)),
          })),
        },
      ],
    };
  }

  if (type === "gauge") {
    // One number against a full-scale `max`. The axis line takes an array of
    // [stop, colour] pairs; both entries are var() references, and because
    // ECharts uses them as discrete bands rather than interpolating between
    // them, they pass through to the SVG untouched.
    //
    // LOCAL DEVIATION (2026-10-01 spike, Part 4). A 220° arc is wider than it is
    // tall: it reaches only sin(20°) ≈ 0.34 of its radius below its centre. Left
    // centred, it filled the top two thirds of its box and the rest was empty.
    // So the centre sits low and the radius is a share of the box's *height*
    // (ECharts takes a percentage of half the shorter side), which lets a 2:1
    // box hold the arc with nothing to spare. A host that still reserves 4:3
    // gets a bigger gauge that still fits. See README "Known local deviations".
    const value = numbers(spec)[0] ?? 0;
    const max = spec.max ?? 100;
    return {
      ...base,
      tooltip: { show: false },
      series: [
        {
          type: "gauge",
          min: 0,
          max,
          startAngle: 200,
          endAngle: -20,
          center: ["50%", "72%"],
          radius: "130%",
          progress: { show: true, width: 14, itemStyle: { color: cssColor(spec.series[0]?.color, 0) } },
          // The progress band is hoverable even with the pointer hidden, so it
          // needs the same explicit emphasis fill as every other mark.
          emphasis: emphasisFor(cssColor(spec.series[0]?.color, 0)),
          axisLine: { lineStyle: { width: 14, color: [[1, "var(--md-border)"]] } },
          axisTick: { show: false },
          splitLine: { length: 10, lineStyle: { color: "var(--md-border)" } },
          axisLabel: { color: "var(--md-muted)", distance: 18, fontSize: 11 },
          pointer: { show: false },
          anchor: { show: false },
          title: { show: Boolean(spec.series[0]?.label), offsetCenter: [0, "34%"], color: "var(--md-muted)" },
          detail: { valueAnimation: true, offsetCenter: [0, "2%"], fontSize: 30, color: "var(--md-fg)" },
          data: [{ value, name: spec.series[0]?.label ?? "" }],
        },
      ],
    };
  }

  if (type === "heatmap") {
    // Colour comes from a **piecewise** `visualMap`, which also gives the chart
    // a real legend the reader can click to filter by band.
    //
    // Piecewise specifically, and the distinction is not cosmetic. A continuous
    // visualMap interpolates between endpoint colours, so it parses them first
    // (`VisualMapping.js` → `fastLerp(normalized, parsedVisual)`), and anything
    // unparseable is replaced by `[0, 0, 0, 1]` — a `var()` gradient renders a
    // solid black heatmap. Give each piece its own `color` and a different path
    // runs: `hasSpecialVisual` is set, and `getSpecifiedVisual` returns the
    // string verbatim. So the tokens survive and the chart still re-themes with
    // no JavaScript, like every other type.
    //
    // The cost is that the scale is stepped rather than smooth. That is the
    // honest price of not resolving colours, and the legend makes the steps
    // legible rather than merely coarse.
    const cells = spec.series.flatMap((s) => s.data as Array<[number, number, number]>);
    const values = cells.map(([, , v]) => v);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, min + 1);
    const pieces = rampPieces(min, max);

    return {
      ...base,
      legend: { show: false },
      tooltip: { trigger: "item", ...TOOLTIP },
      grid: { left: 76, right: 20, top: 16, bottom: 64 },
      visualMap: {
        type: "piecewise",
        // Every piece carries its own colour. Removing one sends that band back
        // through the interpolating path, which cannot read a `var()`.
        pieces,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemWidth: 14,
        itemHeight: 12,
        textStyle: { color: "var(--md-muted)" },
        // The component draws its own chrome, and its defaults are literals in
        // the same way `axisPointer`'s are.
        borderColor: "transparent",
        backgroundColor: "transparent",
        inactiveColor: "var(--md-border)",
      },
      // `splitArea` backs the cells that have no datum. Its default colours are
      // two hardcoded light greys, and they would stay light grey in dark mode.
      // Named here, and only on one axis, since two overlapping split areas
      // double their own opacity.
      xAxis: {
        type: "category",
        data: categories,
        splitArea: { show: true, areaStyle: { color: ["var(--md-surface)"] } },
        ...AXIS,
      },
      yAxis: { type: "category", data: spec.y ?? [], splitArea: { show: false }, ...AXIS },
      series: [
        {
          type: "heatmap",
          // The resting colour is the visualMap's job, but the **emphasis** fill
          // still has to be stated per cell or ECharts derives one and the cell
          // vanishes on hover. Both sides read the same `rampPieces` output, so
          // the hovered colour cannot drift from the mapped one.
          data: cells.map(([col, row, value]) => ({
            value: [col, row, value],
            emphasis: emphasisFor(pieceColorFor(value, pieces)),
          })),
          // On the cells, so --md-surface for the reason the funnel above uses
          // it — every band of the ramp is a mid-tone the body ink cannot sit on.
          label: { show: true, color: "var(--md-surface)", fontSize: 11 },
          itemStyle: { borderColor: "var(--md-surface)", borderWidth: 1 },
        },
      ],
    };
  }

  if (type === "scatter") {
    // Scatter plots both axes as values and ignores `x`; the points carry their
    // own coordinates as [x, y] pairs.
    return {
      ...base,
      tooltip: { trigger: "item", ...TOOLTIP },
      grid: { left: 52, right: 20, top: 24, bottom: labelled ? 44 : 28 },
      xAxis: { type: "value", ...AXIS },
      yAxis: { type: "value", ...AXIS },
      series: spec.series.map((s, i) => ({
        type: "scatter",
        name: s.label,
        data: s.data,
        itemStyle: { color: cssColor(s.color, i) },
        emphasis: emphasisFor(cssColor(s.color, i)),
      })),
    };
  }

  // bar / hbar / line / area share one cartesian frame; `hbar` swaps the axes.
  const horizontal = type === "hbar";
  const categoryAxis = { type: "category", data: categories, ...AXIS };
  const valueAxis = { type: "value", ...AXIS };

  return {
    ...base,
    tooltip: { trigger: "axis", axisPointer: AXIS_POINTER, ...TOOLTIP },
    grid: { left: 52, right: 20, top: 24, bottom: labelled ? 44 : 28 },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: spec.series.map((s, i) => {
      const color = cssColor(s.color, i);
      const line = type === "line" || type === "area";
      return {
        type: horizontal || type === "bar" ? "bar" : "line",
        name: s.label,
        data: s.data,
        itemStyle: { color },
        ...(line ? { lineStyle: { color }, showSymbol: false, smooth: false } : {}),
        // `opacity` rather than a colour-mix keeps the fill a single var()
        // reference, so it still re-themes on its own. The Chart.js version had
        // to build an `rgba()` literal here by regex, because canvas has no
        // separate opacity attribute to set.
        ...(type === "area" ? { areaStyle: { color, opacity: 0.22 } } : {}),
        emphasis: {
          ...emphasisFor(color),
          // A line series highlights its *stroke*, not its fill, so it needs its
          // own explicit colour or `liftColor` runs on `lineStyle` instead.
          ...(line ? { lineStyle: { color, width: 3 } } : {}),
          // And an area chart has a third paintable surface. The wash under the
          // line is the largest thing on screen, so when it was the one style
          // left to ECharts, hovering an area chart blanked most of the chart.
          ...(type === "area" ? { areaStyle: { color, opacity: 0.3 } } : {}),
        },
      };
    }),
  };
}

/** The single-series types all want plain numbers; validation has already guaranteed them. */
function numbers(spec: GraphSpec): number[] {
  return (spec.series[0]?.data ?? []).map((v) => (typeof v === "number" ? v : 0));
}

/**
 * The heatmap colour scale, low to high.
 *
 * Five named tokens rather than an interpolated gradient. Every step is a
 * `var()` reference, which is the whole point — see the heatmap branch.
 */
const RAMP = ["info", "accent", "success", "warning", "danger"] as const;

export interface RampPiece {
  min: number;
  max: number;
  color: string;
}

/**
 * Splits the data range into one piece per ramp token.
 *
 * The single source of truth for heatmap colour: the `visualMap` renders these
 * as its legend and uses them to paint each cell, and the per-cell emphasis fill
 * is looked up from the same array. Two independent bucketings would eventually
 * disagree, and the disagreement would only show on hover.
 */
function rampPieces(min: number, max: number): RampPiece[] {
  const span = (max - min || 1) / RAMP.length;
  return RAMP.map((token, i) => ({
    min: min + span * i,
    max: min + span * (i + 1),
    color: `var(--md-color-${token})`,
  }));
}

/** The piece a value falls in. Clamped, so the top value lands in the last band. */
function pieceColorFor(value: number, pieces: RampPiece[]): string {
  const piece = pieces.find((p) => value >= p.min && value < p.max);
  return (piece ?? pieces[pieces.length - 1]).color;
}
