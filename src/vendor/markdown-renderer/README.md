# markdown-renderer

Vendored, not authored here. Source of truth is the spike:

    5. Virality/Spikes/2026-08-09 - Custom Markdown Renderer/demo/markdown-renderer/

Copied 2026-08-10. Treat these files as read-only: fix bugs in the spike and re-copy,
so the two don't drift. Every import inside this folder is relative, which is what lets
it drop into any project without path-alias configuration.

> **In this portfolio (Kleos, 2026-11-14).** Re-copied from the Writer's vendored copy
> (`SOT Writer Workspace/vendor/markdown-renderer/` in this repo), byte for byte except this note,
> as Junda's and Fatima's sites do: four copies, one source. Fix upstream in the Writer and re-copy
> all three. First copied 2026-10-08 (2026-10-06 spike, Part 1e); this copy adds crops (Part 5g).
> It renders Gael's projects and blog posts, which the site lists and fetches from the Writer.
>
> - The host here is `src/components/WriteupArticle.tsx`, the only thing that imports it, with
>   its styles in `WriteupArticle.css`. Where this README says `src/components/Article.tsx`,
>   `Article.module.css` or `src/styles/tokens.css`, it means Junda's site; read those as
>   `WriteupArticle` and its stylesheet.
> - Pages are rendered on the server from cached Writer data (`src/lib/writer.ts`, refreshed
>   every 10 seconds), so rule 1 stands for the same reason.

## What it is

`react-markdown` v10 + `remark-gfm` + `remark-directive` + `rehype-slug`, plus one
original remark plugin (`plugins/remarkCustomDirectives.ts`) that adds five authoring
directives. See `AUTHORING.md` for the syntax — in particular the one/two/three-colon
rule, which is learnable in a minute but not guessable.

Charts come from ECharts 6, drawn on the client with the **SVG renderer**. The choice is
argued in `Findings - Graphs (echarts, client-side).md` in the spike; the short version
is that the SVG renderer writes `var(--md-color-…)` straight into the chart's `fill`
attributes, so the CSS cascade re-themes every chart with no JavaScript at all. The
Chart.js variant this replaced was a third of the weight but needed a theme bridge to
fake that property, and the bridge failed silently when it was got wrong.

Entry point is `MarkdownArticle`. In this project it is wrapped by
`src/components/Article.tsx`, which is the only thing that should import it.

## Two rules

**1. It must stay a server component.** All three `/work/[slug]` pages are prerendered,
so markdown parses at build time and the browser gets none of it. Rendering
`MarkdownArticle` from inside a client tree pulls ~178 kB of parser (plus the
`react-icons` import graph) into the client bundle. `npm run build` will not warn you.

There is exactly one `"use client"` file, `components/GraphClient.tsx`, and the carve-out
is deliberately narrow: it receives an already-validated spec, so there is no import path
from it back to react-markdown. ECharts and the option builder both travel through the
single dynamic import in `lib/echartsClient.ts`. Two ways to undo that, neither of which
`npm run build` will flag — importing `echarts` (or `lib/graphOption`) statically from
`GraphClient` moves ~200 kB gz into the initial bundle; and importing the
`echarts/charts` barrel instead of naming each chart defeats tree-shaking and roughly
doubles the deferred chunk. Nothing else in this folder may use hooks, state, or browser
globals.

**2. Styling lives in the host.** The spike ships an `article.css` that was deliberately
*not* copied — its generic prose rules would fight the editorial typography in
`src/components/Article.module.css`. The directive-specific parts of it were re-expressed
in project design tokens instead, in that file's "custom directive elements" section.

That makes the class names below a contract. The renderer emits them as literals; the
host styles them via `:global()` inside the CSS module, so they must match exactly:

| Class | Emitted by |
| :--- | :--- |
| `md-article` | root `<article>` |
| `md-scroll` | wrapper around wide tables and `<pre>` |
| `md-color` + `data-color="<token>"` | `:color` / `:::color` |
| `md-image`, `md-inline-image` | `::image`, plain `![]()` |
| `md-image--pinned`, `md-image__frame`, `md-image__pins`, `md-pin` + `data-side`/`data-room`/`data-v`, `md-pin__details`, `md-pin__dot`, `md-pin__card`, `md-pin__label`, `md-pin__desc`, `md-image__toggle`, `md-image__hide`, `md-image__toggle-hide`, `md-image__toggle-show` | `:::image` with pins (local deviation, below) |
| `md-video`, `md-video--embed`, `md-video--file`, `md-video__frame`, `md-video__player` | `::video` |
| `md-artifact`, `md-artifact__icon`, `md-artifact__label`, `md-artifact__ext` | `::artifact_b` |
| `md-graph` + `data-graph-type="<type>"`, `md-graph__mount` | `:::graph` |
| `md-visually-hidden` | screen-reader text inside artifact buttons |
| `md-directive-error` | dev-only diagnostics; renders `null` in production |

The colour vocabulary is `registry/colors.ts` (8 tokens), the icon vocabulary is
`registry/icons.ts` (32 names), and the chart vocabulary is `registry/graphs.ts` (11
types). Adding to any of them means editing the spike — that is intentional, since it
keeps the author-facing vocabulary reviewable.

**Charts need the tokens to be real CSS custom properties in scope on the article**, not
just values baked into a stylesheet. `lib/graphOption.ts` emits `var(--md-color-*)`,
`var(--md-fg)`, `var(--md-muted)`, `var(--md-border)`, `var(--md-surface)` and
`var(--md-shadow)` as literal strings and lets the cascade resolve them at paint time; a
host that resolves them itself and hardcodes the results will get charts that stop
following the theme. `.md-graph__mount` reserves the chart's aspect ratio before the SVG
exists; removing it makes every chart shift the page as it draws (measured CLS goes from
0 to nonzero), and ECharts also needs a definite height on the mount to size itself at
init.

## Known local deviations

- The root element is a hardcoded `<article>`, so a work page carrying both an Overview
  and an In-detail section has two of them. Valid HTML, mildly noisy as landmarks.
- Images are plain `<img>`, not `next/image`. Isolated to `components/ArticleImage.tsx`
  if that ever needs to change.
- No syntax highlighting. The intended fix is `rehype-pretty-code` or `shiki` added to
  `rehypePlugins` in `MarkdownArticle.tsx` — it stays server-side, so it still costs
  zero client JS.
- Charts are absent from the HTML and appear a moment after first contentful paint. The
  space is reserved, so nothing shifts, but a reader on a slow link sees empty boxes for
  longer. `_old/v4-mdr/` is the server-rendered variant if that tradeoff ever needs
  reversing; it uses the same library and the same `var()` colour discipline.
- ECharts is the heaviest of the three candidates measured. It is ~200 kB gz in a
  deferred chunk that never loads for a reader who does not scroll to a chart, but it is
  a real cost on an article that has one. `_old/v5-mdr/` is the Chart.js variant at a
  third of the weight, if bytes ever matter more than the theme bridge it requires.
- **`lib/graphOption.ts` is the one file here that is NOT byte-identical to the spike.**
  Funnel slice labels and heatmap cell labels were `var(--md-fg)`, painted on top of the
  marks they label. Measured against this site's tokens that is 2.4:1–3.6:1 on every
  heatmap band, and 1:1 — black on black, invisible — on a funnel slice taking the
  `primary` token. Both now use `var(--md-surface)`, which is what the treemap branch in
  the same file already did for the same job, and which measures 4.8:1–17:1 across the
  palette. The bug is upstream too (black on the spike's `#1a5fb4` low band is ~2.2:1),
  so this wants pushing back rather than re-applying after the next drop.
- **The gauge (2026-10-01 spike, Part 4).** Also in `lib/graphOption.ts`: the gauge's
  `center` is `["50%", "72%"]` and its `radius` `"130%"` (was centred, `"92%"`). A 220°
  arc reaches only 0.34 of its radius below its centre, so a centred gauge in the 4:3 box
  left the bottom third empty. The host's `.md-graph__mount` for `data-graph-type="gauge"`
  should now be `aspect-ratio: 2 / 1`, as the Brundain workspace's editor sets it; that's
  where the height is saved. A host left at 4:3 still fits (7px to spare each side at
  544px wide) with a bigger gauge. Wants pushing upstream with the host CSS change.
- **Pins on images (2026-10-06 spike, Part 1).** `image` also takes the container form,
  `:::image{src=…}` around a ```` ```json ```` body of pins, each with `x` and `y` as percentages
  and an optional `label` and `description` (syntax in AUTHORING.md, "Pins"). Files:
  - `lib/imagePins.ts` (new): `validatePins`, strict like `validateSpec`, with no imports.
  - `plugins/remarkCustomDirectives.ts`: `image` is `kinds: ["leaf", "container"]` with
    `body: "code"`, and a body is lifted only from a container, so `graph` and leaf images are
    unchanged.
  - `components/ArticleImage.tsx`: `spec` draws numbered pins, each a `<details name="md-pins">`,
    so they open on a click, a tap or Enter with no JavaScript, one at a time. It stays a server
    component. A bad body draws the image without pins, plus a `DirectiveError`. `overlay` is a
    slot only the Brundain editor fills. Without `spec` or `overlay` the HTML is unchanged.
  - AUTHORING.md: the "Pins" section.

  **The published site must take this change, and the host CSS for the `md-pin*` classes above,
  before any doc with pins is published.** Its current copy would treat `:::image` as a known name
  in the wrong form and unwrap it: the pins' JSON would publish as a code block, and the image not
  at all. The Brundain workspace's rules are in `src/writer/wysiwyg/article.css` ("Pins on an
  image"). The
  pins are an `<ol>`, so the host's prose list rules must not reach `.md-image__pins`: the
  workspace's own `ol` margin did, and shrank the layer the pins are placed in by 1em. Wants
  pushing upstream with the rest.

  **2026-10-22 Part 2d** (Brundain spike, Junda's first round: "pins cover what they mark"):
  - Each `md-pin` says where its card opens: `data-side` (`left`/`right`, away from the image's
    centre except near an edge), `data-room` (the side with more room, for narrow screens) and
    `data-v` (`top`/`middle`/`bottom`). They replace `data-v` (`above`/`below`) and `data-h`.
  - After the frame, a `<label class="md-image__toggle">` holds a checkbox (`md-image__hide`) and
    two spans, "Hide pins" and "Show pins". The host hides `.md-image__pins` when it's checked
    (`:has` on the figure), and shows the span that fits. It's under the image, not on it: in a
    corner it covered the pins placed there.
  - The host CSS draws a pin as a small unnumbered ring until the frame is hovered or has focus,
    and no longer opens a card on hover: on a click, a tap or Enter only.
- **Crops on images (2026-11-10, Brundain spike Part 5g).** `image` takes `crop="x,y,w,h,ratio"`:
  the part of the picture shown, as percentages, and that part's width over height in pixels, so
  the frame is sized before the picture loads. CSS only; it stays a server component. Files:
  - `lib/imageCrop.ts` (new, no imports): `parseCrop`, `writeCrop`, `cropStyles`, and
    `intoCrop`/`outOfCrop` for pins.
  - `plugins/remarkCustomDirectives.ts`: `crop` among `image`'s attributes.
  - `components/ArticleImage.tsx`: a crop puts the image in `.md-image__frame` with the frame's
    shape and `overflow: hidden`, and the figure gets `md-image--cropped`. Pins on a cropped image
    are percentages of the part shown. A crop that doesn't read is ignored. Without `crop` the HTML
    is unchanged.

  **The published site takes the same three files.** Its copy is `portfolio-junda/src/markdown-renderer/`.

- The `--md-*` custom properties the charts resolve against are defined in this project by
  `src/components/Article.module.css`, on the same `.prose` class `Article.tsx` hands the
  renderer — so they are in scope on the `<article>` that carries `md-article`. That file
  is also where `.md-graph__mount`'s aspect-ratio reservation lives. Both are restated in
  `src/styles/tokens.css` terms rather than copied from `article.css`, per rule 2 above.

## Dependency notes

`react-markdown` should stay on `10.x`. `components/index.tsx` casts its component map
with `as unknown as Components` to register the custom `md-*` tag names, which relies on
`hast-util-to-jsx-runtime` looking up `components[tagName]` for any tag name. A major
bump could break that silently — the spike's 42 vitest tests are what would catch it,
and they are not ported here.

`echarts` must stay on `6.x`. `lib/echartsClient.ts` imports chart classes by name from
`echarts/charts`, and a major bump could rename or resplit them. More subtly, the whole
theming strategy rests on ECharts passing an unrecognised colour string through to the
SVG untouched rather than parsing it — `tests/graphs.test.tsx` proves `buildOption` emits
only `var()` references, but only the Playwright probes in the spike's `graph-spike/`
would catch a version that started resolving them.

**The sharp edge, and it has already drawn blood once.** ECharts will happily *pass* a
`var()` through, but never *derive* a colour from one. Anywhere it would normally compute a
shade — hover states most of all — `parse()` rejects the token, the computed colour comes
back `undefined`, and the mark is painted with nothing. It does not throw and it does not
warn; the shape simply disappears, and only while the pointer is on it.

Two rules follow, and neither is enforced by the compiler:

- **Every series sets an explicit `emphasis` colour** — `itemStyle` for a fill, `lineStyle`
  for a line's stroke, `areaStyle` for an area's wash. Miss one surface and that surface
  vanishes on hover.
- **Prefer options that name a colour over options that make one.** A heatmap uses a
  *piecewise* `visualMap` with a colour per band, never a continuous one: continuous
  interpolates, interpolating parses, and an unparseable colour is silently replaced with
  black.

`graph-spike/probes/zero-js.mjs` hovers every chart type and checks this. Adding a chart
type without adding it there is how this regresses.

`unified`, `vfile` and `@types/unist` are type-only imports in
`plugins/remarkCustomDirectives.ts`. They are pinned in `devDependencies` rather than
left to npm's flat-hoisting, so a lockfile reshuffle can't break `tsc`.
