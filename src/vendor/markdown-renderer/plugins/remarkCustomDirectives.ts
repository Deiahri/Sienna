import { SKIP, visit } from "unist-util-visit";
import type { Node, Parent } from "unist";
import type { Plugin } from "unified";
import type { VFile } from "vfile";

/**
 * Turns the custom directives into elements react-markdown can intercept.
 *
 * `remark-directive` only gets us as far as `textDirective` / `leafDirective` /
 * `containerDirective` nodes. This plugin validates each one against the
 * registry below and sets `data.hName` + `data.hProperties`, which
 * `remark-rehype` honours when it builds the HTML tree. The resulting `md-*`
 * tag names are then matched by keys in the `components` map.
 */

type DirectiveKind = "text" | "leaf" | "container";

interface DirectiveSpec {
  /** Which directive forms are legal for this name. */
  kinds: readonly DirectiveKind[];
  /** The element name the components map keys off. */
  hName: string;
  /** Attribute allowlist — anything else the author writes is dropped. */
  attrs: readonly string[];
  /**
   * `"code"` collapses a fenced code child into a `spec` property and drops the
   * children, so the component receives the block's raw source as a string
   * rather than an already-rendered `<pre>`. Used by `graph`, whose payload is a
   * JSON document too large to fit in directive attributes, and by `image`'s
   * container form, whose body is its pins. A leaf form has no body to lift.
   */
  body?: "code";
}

export const DIRECTIVES = {
  color: {
    kinds: ["text", "container"],
    hName: "md-color",
    attrs: ["val"],
  },
  video: {
    kinds: ["leaf"],
    hName: "md-video",
    attrs: ["src", "title", "t"],
  },
  // `:::image` around a ```json body puts pins on it: a local deviation (2026-10-06 spike, Part 1),
  // see README.md and lib/imagePins.ts. The leaf form is unchanged.
  image: {
    kinds: ["leaf", "container"],
    hName: "md-image",
    // 2026-11-10 Part 5g: `crop`, a local deviation (lib/imageCrop.ts).
    attrs: ["src", "alt", "caption", "crop"],
    body: "code",
  },
  artifact_b: {
    kinds: ["leaf", "text"],
    hName: "md-artifact",
    attrs: ["src", "icon", "label"],
  },
  graph: {
    kinds: ["container"],
    hName: "md-graph",
    attrs: ["type", "caption"],
    body: "code",
  },
} as const satisfies Record<string, DirectiveSpec>;

export type DirectiveName = keyof typeof DIRECTIVES;

const KIND_BY_TYPE: Record<string, DirectiveKind> = {
  textDirective: "text",
  leafDirective: "leaf",
  containerDirective: "container",
};

interface CodeNode extends Node {
  type: "code";
  value: string;
}

interface DirectiveNode extends Node {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined> | null;
  children?: Node[];
  data?: {
    hName?: string;
    hProperties?: Record<string, string>;
    [key: string]: unknown;
  };
}

function isDirective(node: Node): node is DirectiveNode {
  return node.type in KIND_BY_TYPE;
}

/**
 * The literal markdown that produced a node.
 *
 * Used to fail soft: an unrecognised directive renders as the text the author
 * typed rather than vanishing. That matters more than it sounds, because
 * `remark-directive` claims any `:word` — so prose like "the ratio a:b" parses
 * as a text directive named `b`, and silently dropping it would eat the text.
 */
function sourceText(node: Node, file: VFile): string | undefined {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  if (typeof start !== "number" || typeof end !== "number") return undefined;
  return String(file).slice(start, end);
}

export const remarkCustomDirectives: Plugin<[], Node> = () => {
  return (tree: Node, file: VFile) => {
    visit(tree, (node: Node, index?: number, parent?: Parent) => {
      if (!isDirective(node)) return;

      const kind = KIND_BY_TYPE[node.type];
      const spec: DirectiveSpec | undefined = Object.prototype.hasOwnProperty.call(
        DIRECTIVES,
        node.name,
      )
        ? DIRECTIVES[node.name as DirectiveName]
        : undefined;

      if (!spec || !spec.kinds.includes(kind)) {
        return failSoft(node, kind, index, parent, file);
      }

      const attributes = node.attributes ?? {};
      const hProperties: Record<string, string> = {};
      for (const key of spec.attrs) {
        const value = attributes[key];
        if (typeof value === "string" && value !== "") {
          hProperties[key] = value;
        }
      }
      // Container vs text colour need different elements (`div` vs `span`), and
      // only the plugin knows which form the author used.
      hProperties.kind = kind;

      // A `body: "code"` directive carries its payload as a fenced block. Lift
      // that block's source into a property and drop the children, so the
      // component receives a string. An empty or missing body is left for the
      // component to report: the plugin's job here is transport, not validation.
      // Only a container has a body; a leaf keeps its children, as it always did.
      if (spec.body === "code" && kind === "container") {
        const code = (node.children ?? []).find((child): child is CodeNode => child.type === "code");
        if (code) hProperties.spec = code.value;
        node.children = [];
      }

      node.data = { ...node.data, hName: spec.hName, hProperties };
      return undefined;
    });
  };
};

/**
 * Recovers from an unknown directive name, or a known name used in the wrong
 * form (`:video[…]` instead of `::video{…}`), without losing the author's text.
 */
function failSoft(
  node: DirectiveNode,
  kind: DirectiveKind,
  index: number | undefined,
  parent: Parent | undefined,
  file: VFile,
): [typeof SKIP, number] | undefined {
  if (!parent || index === undefined) return undefined;

  // A container wraps real content; unwrap it so the body survives, styled as
  // plain markdown. Emitting its `:::` fences as literal text would be worse.
  if (kind === "container") {
    const children = node.children ?? [];
    parent.children.splice(index, 1, ...(children as Parent["children"]));
    return [SKIP, index];
  }

  const raw = sourceText(node, file);
  if (raw === undefined) {
    parent.children.splice(index, 1);
    return [SKIP, index];
  }

  parent.children.splice(index, 1, {
    type: "text",
    value: raw,
  } as Parent["children"][number]);
  return [SKIP, index + 1];
}
