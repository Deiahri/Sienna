import { isGraphType, validateSpec } from "../registry/graphs";
import { DirectiveError } from "./DirectiveError";
import { GraphClient } from "./GraphClient";

interface GraphProps {
  /** Chart type from `registry/graphs.ts`. */
  type?: string;
  caption?: string;
  /** Raw JSON body, lifted out of the fenced block by the directive plugin. */
  spec?: string;
}

/**
 * `:::graph{type=bar}` wrapping a fenced JSON body.
 *
 * This stays a **server** component even though the chart is drawn on the
 * client, and the split is the point: parsing and validating the author's JSON
 * here means a bad spec is caught while the page is being built, shows a
 * diagnostic to the author, and never ships. Only the validated result crosses
 * to the browser, so `JSON.parse`, the registry and the error strings all stay
 * out of the client bundle.
 *
 * Validation is type-aware — `validateSpec` is handed the declared type — so
 * the diagnostic can say what a heatmap or a gauge specifically needs rather
 * than restating the generic schema. For the AI-agent case the error message is
 * the documentation, and a message that names the fix is the difference between
 * an agent correcting itself on the next turn and looping.
 *
 * What it cannot do is draw anything. This is the client-side variant, so there
 * is no chart in the HTML — the figure reserves its space and `GraphClient`
 * fills it in once the library loads. The reserved box is what keeps the page
 * from reflowing as charts arrive.
 */
export function Graph({ type, caption, spec }: GraphProps) {
  if (!isGraphType(type)) {
    return <DirectiveError message={`graph: unknown type ${JSON.stringify(type ?? null)}`} />;
  }
  if (!spec || spec.trim() === "") {
    return (
      <DirectiveError message="graph: missing JSON body — the chart data goes in a fenced ```json block inside the directive" />
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(spec);
  } catch (error) {
    // Trailing commas are the single most common thing both authors and agents
    // get wrong here, so say what broke rather than throwing a stack trace.
    return (
      <DirectiveError
        message={`graph: body is not valid JSON (${error instanceof Error ? error.message : "parse failed"})`}
      />
    );
  }

  const result = validateSpec(parsed, type);
  if ("error" in result) {
    return <DirectiveError message={`graph: ${result.error}`} />;
  }

  return (
    <figure className="md-graph" data-graph-type={type}>
      {/*
        The chart is SVG, so its axis and series labels are real text — they are
        selectable, findable with ctrl-F, and stay crisp in print. `role="img"`
        with a label still earns its place: ECharts emits that text as a heap of
        absolutely positioned `<text>` nodes in draw order, which a screen
        reader would otherwise read out as an unordered pile of numbers. The
        label gives it one coherent thing to announce instead.
      */}
      <div role="img" aria-label={caption ?? `${type} chart`}>
        <GraphClient type={type} spec={result.spec} />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
