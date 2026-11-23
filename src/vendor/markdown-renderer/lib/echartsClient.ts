/**
 * The single module the client dynamically imports to draw a chart.
 *
 * One target for `GraphClient`'s `await import(…)`, with **static named
 * imports** inside it. That detail decides the size of the deferred chunk:
 * `await import("echarts/charts")` is a namespace import of a barrel file,
 * which esbuild and webpack both refuse to tree-shake, and it drags all 23
 * chart types in. Measured in `graph-spike/`.
 *
 * It also re-exports the option builder, so that travels in the deferred chunk
 * too rather than in the initial bundle.
 *
 * The renderer is **SVG, not canvas, and that is not a preference**. ECharts'
 * SVG renderer writes whatever colour string it is given straight into a `fill`
 * attribute, so `var(--md-color-primary)` survives into the DOM and the
 * browser's cascade resolves it at paint time. That is the entire reason this
 * integration has no theme bridge. The canvas renderer rasterises colours
 * before any CSS is involved and would bring the bridge straight back.
 *
 * Adding a chart type means adding its named import here as well as an entry in
 * `registry/graphs.ts` and a case in `buildOption`.
 */
import {
  BarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
} from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapPiecewiseComponent,
} from "echarts/components";
import { init, use } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";

use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  FunnelChart,
  TreemapChart,
  GaugeChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  // Piecewise only — `VisualMapComponent` installs the continuous half too, and
  // the continuous mapping cannot be used here at all: it interpolates between
  // endpoint colours, which means parsing them, and a `var()` parses to black.
  VisualMapPiecewiseComponent,
  SVGRenderer,
]);

export { buildOption } from "./graphOption";
export { init };
