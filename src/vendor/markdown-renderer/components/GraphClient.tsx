"use client";

import { useEffect, useRef } from "react";
import type { GraphSpec, GraphType } from "../registry/graphs";

/**
 * The renderer's only client component, and the thing that draws the chart.
 *
 * There is no chart in the HTML: ECharts builds the SVG in the browser, so the
 * parent reserves the space (`article.css`) and the chart fades in. Without the
 * reservation the page reflows as each chart arrives.
 *
 * What this component notably does *not* do is theming. ECharts' SVG renderer
 * writes `var(--md-color-…)` straight into the `fill` attribute, so a colour
 * scheme change is resolved by the browser's cascade with no JavaScript at all
 * — nothing to subscribe to, nothing to redraw, nothing to forget. The Chart.js
 * version of this file had to register every chart with a theme bridge and
 * redraw on every switch, and a chart that skipped the registration froze in
 * whatever theme it was born in with nothing thrown and nothing logged.
 *
 * The library still loads lazily, on approach to the viewport, so an article
 * the reader never scrolls through costs nothing. Keeping this the sole
 * `"use client"` boundary is what stops the markdown pipeline from following
 * charts into the browser bundle: it receives a plain validated spec, so there
 * is no import path from here back to react-markdown.
 */
export function GraphClient({ type, spec }: { type: GraphType; spec: GraphSpec }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let chart: { dispose: () => void; resize: () => void } | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;

    async function start() {
      if (cancelled || !host) return;

      // One module for the library *and* the option builder, so neither reaches
      // the initial bundle. See `lib/echartsClient.ts`.
      const { init, buildOption } = await import("../lib/echartsClient");
      if (cancelled) return;

      const instance = init(host, null, { renderer: "svg" });
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      instance.setOption({ ...buildOption(type, spec), animation: !reduced });
      chart = instance;

      // ECharts sizes itself once at init and never again, unlike Chart.js's
      // `responsive: true`. Without this the chart keeps its birth width.
      resizeObserver = new ResizeObserver(() => instance.resize());
      resizeObserver.observe(host);

      host.dataset.drawn = "true";
    }

    // `rootMargin` starts the fetch before the chart is actually needed, so the
    // draw has usually happened by the time it scrolls into view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          void start();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
      resizeObserver?.disconnect();
      chart?.dispose();
    };
  }, [type, spec]);

  return <div ref={hostRef} className="md-graph__mount" />;
}
