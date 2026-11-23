import type { Components } from "react-markdown";
import type { ArticleComponentOptions } from "../types";
import { ArticleImage, InlineImage } from "./ArticleImage";
import { ArtifactButton } from "./ArtifactButton";
import { Color } from "./Color";
import { Graph } from "./Graph";
import { Video } from "./Video";

/**
 * Builds the element→component map for one render.
 *
 * It's a function rather than a module constant because the artifact resolver
 * is injected per-render and the components need to close over it. React
 * context would be the usual answer, but context isn't available to server
 * components, and keeping this a server component is the whole point.
 */
export function buildComponents(options: ArticleComponentOptions = {}): Components {
  const map = {
    // Directive-backed elements, named by `remarkCustomDirectives`.
    "md-color": Color,
    "md-video": Video,
    "md-image": ArticleImage,
    "md-graph": Graph,
    "md-artifact": (props: Record<string, unknown>) => (
      <ArtifactButton {...props} resolveArtifact={options.resolveArtifact} />
    ),

    // Standard markdown, adjusted where the default HTML would misbehave.
    img: InlineImage,
    a: Anchor,
    table: ScrollableTable,
    pre: ScrollablePre,
  };

  // `Components` is typed over `JSX.IntrinsicElements`, so it has no room for
  // custom keys. The runtime is happy with them — hast-util-to-jsx-runtime
  // looks up `components[tagName]` for any tag name — so this asserts what the
  // library already does. See Findings.md.
  return map as unknown as Components;
}

function Anchor({
  href,
  title,
  children,
}: {
  href?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const external = Boolean(href && /^https?:/i.test(href));
  // Props are listed explicitly rather than spread: react-markdown also passes
  // the hast `node`, and spreading it emits a bogus `node="[object Object]"`
  // attribute on every link.
  return (
    <a
      href={href}
      title={title}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/** Wide tables scroll inside the article instead of widening the page. */
function ScrollableTable({ children }: { children?: React.ReactNode }) {
  return (
    <div className="md-scroll">
      <table>{children}</table>
    </div>
  );
}

/** Same for long code lines. */
function ScrollablePre({ children }: { children?: React.ReactNode }) {
  return (
    <div className="md-scroll">
      <pre>{children}</pre>
    </div>
  );
}
