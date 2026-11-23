# Authoring reference — the kitchen sink

Every feature the renderer supports, in one document. If something regresses,
it shows up here first.

Copied from the spike's `fixtures/kitchen-sink.md`. It lives here rather than in
`content/projects/`, which `getAllProjects()` globs — dropping it there would publish
a fake case study.

Two project-specific notes before the syntax:

- **Artifact names resolve against frontmatter.** `src/lib/artifacts.ts` builds the
  resolver from the `artifacts:` array of the project being rendered, matching on the
  exact `label` or its slug. So `::artifact_b[Read the PRD]{src="the-original-prd"}`
  picks up the `href` of the artifact labelled "The original PRD" in that same file.
  An unmatched name is treated as a literal URL.
- **Headings start at `h2`.** The page supplies the `h1`.

## Plain markdown still works

Authors write **bold**, *italic*, `inline code`, ~~strikethrough~~, and
[links to elsewhere](https://example.com) exactly as they always have. That was
the requirement: nothing about the custom extensions should change the format
authors already know.

A relative [link to the playground](/) stays in the same tab, while the example
link above opens in a new one.

### Lists

- First item
- Second item, with a nested list:
  - Nested one
  - Nested two
- Third item

1. Ordered
2. Also ordered
3. Still ordered

- [x] Task lists work (GFM)
- [ ] Even the unchecked ones

### Blockquote

> The riskiest assumption was that HTML-shaped tags would parse cleanly inside
> markdown. They don't, which is why this uses directives instead.

### Table

| Directive | Form | Renders as |
| --- | --- | --- |
| `:color[…]{val=…}` | inline | `<span>` |
| `:::color{val=…}` | block | `<div>` |
| `::video{src=…}` | block | iframe or `<video>` |
| `::image{src=… }` | block | `<figure>` |
| `:::image{src=… }` + pins | block | `<figure>` with numbered pins |
| `::artifact_b{src=… }` | block or inline | `<a target="_blank">` |

### Code

```ts
export function safeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const cleaned = stripControlChars(raw).trim();
  return cleaned || undefined;
}
```

---

## Colour

Inline: this sentence contains :color[primary coloured text]{val=primary} and
:color[a danger warning]{val=danger} and :color[muted commentary]{val=muted},
all resolved from CSS custom properties rather than literal hex values.

Markdown still parses inside the inline form:
:color[**bold and coloured** at the same time]{val=accent}.

An unknown token degrades to the inherited colour rather than breaking:
:color[this token does not exist]{val=chartreuse}.

The block form colours everything it wraps:

:::color{val=success}
### A heading inside a container directive

And a paragraph, plus a list:

- markdown parses normally in here
- including **inline formatting**
:::

## Video

A YouTube `watch?v=` link:

::video{src="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="watch?v= form"}

The short `youtu.be` form, starting 30 seconds in:

::video{src="https://youtu.be/aqz-KE-bpKQ?t=30" title="youtu.be form, ?t=30"}

A `/shorts/` link:

::video{src="https://www.youtube.com/shorts/aqz-KE-bpKQ" title="shorts form"}

A direct video file, which falls back to the browser's own player:

::video{src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" title="Direct mp4"}

## Images

The block form, with a caption:

::image{src="https://picsum.photos/id/1015/1200/675" alt="A river running through a canyon" caption="The block form carries a caption."}

The block form without one:

::image{src="https://picsum.photos/id/1025/1200/675" alt="A pug wearing a blanket"}

Plain markdown images still work and stay inline in their paragraph:
![A mountain lake](https://picsum.photos/id/1016/1200/675)

### Pins

Three colons and a fenced JSON block of pins put numbered points on an image.
Each one opens its label and description on a click, a tap or Enter, and on
hover where the browser allows it. Opening one closes the others.

:::image{src="https://picsum.photos/id/1015/1200/675" alt="A river running through a canyon" caption="Click a number."}
```json
{
  "pins": [
    { "x": 22, "y": 30, "label": "The rim", "description": "Where the trail starts." },
    { "x": 64.5, "y": 72, "label": "The river", "description": "Low in late summer." }
  ]
}
```
:::

`x` and `y` are percentages of the image's width and height, from its top-left
corner, so a pin stays on its spot at any size. A value past 0 or 100 is pulled
back to the edge. `label` and `description` are optional strings. Pins are
numbered in the order they're written.

A bad body still publishes the image, without its pins, and the validator says
what's wrong:

| What you wrote | What you get |
| --- | --- |
| `"points": […]` | ``image: the body needs a `pins` array (found `points` — did you mean `pins`?)`` |
| `"x": "40%"` | `` image: pins[0].x must be a number, the percent of the image's width (found "40%") `` |
| `"title": "…"` on a pin | ``image: pins[0] has `title` — did you mean `label`?`` |
| a trailing comma | `image: pins are not valid JSON (…)` |

(Pins are a local addition, not in the upstream renderer yet: see README.md.)

## Artifact buttons

Resolved through the host site's registry, so authors write stable names:

::artifact_b[Read the onboarding spec]{src="onboarding-spec" icon=doc}

::artifact_b[LinkedIn flagging report]{src="flagging-report" icon=chart}

::artifact_b[Browse the API reference]{src="api-reference" icon=code}

Icons are swappable from the registry — `people`, `computer`, `world`, `lock`,
`database`, `terminal`:

::artifact_b[People]{src="api-reference" icon=people}
::artifact_b[Computer]{src="api-reference" icon=computer}
::artifact_b[World]{src="api-reference" icon=world}
::artifact_b[Lock]{src="api-reference" icon=lock}
::artifact_b[Database]{src="api-reference" icon=database}
::artifact_b[Terminal]{src="api-reference" icon=terminal}

An unknown icon name falls back to a generic file icon rather than failing:

::artifact_b[Unknown icon falls back]{src="api-reference" icon=definitely-not-an-icon}

A name with no registry entry is treated as a literal URL:

::artifact_b[Literal URL]{src="https://example.com/whitepaper.pdf" icon=download}

The inline form uses a *single* colon, so it can sit mid-sentence — see
:artifact_b[the spec]{src="onboarding-spec" icon=doc} for detail. (Two colons
means "block-level", which is why `::` only works on its own line.)

## Graphs

`:::graph{type=…}` wraps a fenced JSON block. The colon count is three, because
the chart data is a *body*, not an attribute.

:::graph{type=bar caption="Signups by week"}
```json
{
  "x": ["W1", "W2", "W3", "W4"],
  "series": [{ "label": "Signups", "color": "primary", "data": [12, 30, 21, 44] }]
}
```
:::

`type` is one of `bar`, `hbar`, `line`, `area`, `scatter`, `pie`, `donut`,
`funnel`, `treemap`, `gauge`, `heatmap`. `caption` is optional, renders as a
`<figcaption>`, and becomes the chart's accessible name.

Each entry in `series` takes an optional `label`, an optional `color` — one of
the same eight tokens `:color` uses — and a `data` array. Omit `color` and series
are assigned tokens in order, so a chart is correctly themed by default.

`x` supplies category labels for bar/hbar/line/area and slice labels for
pie/donut/funnel/treemap. Scatter takes `[x, y]` pairs instead and ignores `x`:

:::graph{type=scatter caption="Session length against retention"}
```json
{ "series": [{ "label": "Cohort", "color": "secondary", "data": [[1, 2], [3, 5], [7, 9]] }] }
```
:::

### The four types with their own rules

Most types take the shape above unchanged. Two do not, and the validator will
tell you so by name if you get them wrong.

**`gauge`** plots one number against a full scale, which you set with `max`
(default 100). One series, one number:

:::graph{type=gauge caption="Uptime this quarter"}
```json
{ "max": 100, "series": [{ "label": "Uptime %", "color": "success", "data": [99.4] }] }
```
:::

**`heatmap`** needs `y` for its row labels alongside `x` for its columns, and
its cells are `[column, row, value]` triples indexed into those two arrays:

:::graph{type=heatmap caption="Sessions by day and part of day"}
```json
{
  "x": ["Mon", "Tue", "Wed"],
  "y": ["Morning", "Evening"],
  "series": [{ "data": [[0, 0, 12], [1, 0, 18], [2, 0, 15], [0, 1, 30], [1, 1, 41], [2, 1, 38]] }]
}
```
:::

Cell colour comes from a five-step scale across the palette, low to high, and
the chart shows it as a legend underneath. Readers can click a band to filter the
heatmap down to it. The scale is deliberately stepped rather than a smooth
gradient — see **Colours** below.

**`funnel`** and **`treemap`** take exactly the same spec as `pie`: one series
of numbers, labelled from `x`. A funnel always sorts descending, so it will not
preserve the order you wrote.

### How charts are drawn, and why it shows

Charts are the one thing in this renderer that is **not** in the HTML. ECharts
builds the chart in the browser, so it appears a moment after the text around
it. The space is reserved in advance, so nothing moves when it arrives.

Once it does arrive it is a real SVG, which means the axis labels and series
names are selectable text — you can search the page for them, and they stay
sharp when printed or zoomed.

Your JSON is still validated on the server. A broken spec is caught while the
page is being built and never reaches the browser, so the failure modes below
behave exactly like every other directive: a diagnostic in development, nothing
in production.

| What you wrote | What you get |
| --- | --- |
| `type=piechart` | `graph: unknown type "piechart"` |
| a trailing comma | `graph: body is not valid JSON (…)` |
| `"data": [1, "two"]` | `graph: series[0].data[1] is "two" — data must be numbers, [x, y] number pairs for scatter, or [column, row, value] triples for heatmap` |
| `"datasets": […]` | ``graph: spec needs a `series` array (found `datasets` — did you mean `series`?)`` |
| `"labels": […]` | ``graph: found `labels` — category labels go in `x` `` |
| `type=heatmap` with no `y` | ``graph: heatmap needs a `y` array of row labels, alongside `x` for the columns`` |
| `type=heatmap` with `"rows"` | ``graph: heatmap needs a `y` array of row labels (found `rows` — did you mean `y`?)`` |
| a heatmap cell off the grid | `graph: series[0].data[1] points at [7, 0], outside the 2×1 grid `x` and `y` describe` |
| `type=gauge` with two series | `graph: gauge plots a single number, so it takes one series — found 2` |
| `type=pie` with two series | ``graph: pie plots a single series of numbers — found 2. Each entry in `series[0].data` becomes one slice, labelled from `x` `` |

### Colours

Write token names, never literals — and unlike most rules of this kind, this one
buys you something concrete. Every colour in a chart is emitted as a
`var(--md-color-…)` reference and written straight into the SVG, so when the
page switches between light and dark the browser re-themes the chart itself.
No script runs, and nothing has to redraw.

That is also why `heatmap`'s scale has five steps rather than being a smooth
gradient: interpolating between two colours means computing the ones in between,
and a computed colour is a frozen literal that no longer follows the theme. Five
named tokens can each be passed through untouched; a gradient could not.

A hex value written as a `color` is ignored rather than rendered, and the
positional palette token is used instead.

**Hovering** keeps the mark's colour and adds an outline, rather than the
lightened shade most charting libraries use. Same reason again: lightening a
colour means computing one.

## Failure modes

An unknown directive renders as the literal text the author typed, so mistakes
are visible rather than silent:

::vidoe{src="https://youtu.be/aqz-KE-bpKQ"}

A known name in the wrong form does the same — `video` is block-only, so this
inline use is left alone: :video[not a real form]{src="x"}.

This matters for ordinary prose, because `remark-directive` claims any `:word`.
The ratio a:b and the time 10:30 both survive untouched, and so does this
Python slice syntax: `items[1:n]`.

An unknown *container* unwraps instead, so its contents are never lost:

:::callout{type=warning}
This paragraph is still here even though `callout` isn't a registered
directive.
:::

A directive missing its `src` shows a diagnostic in development and nothing in
production:

::video{title="no src at all"}

A rejected URL scheme does the same:

::image{src="javascript:alert(1)" alt="blocked"}
