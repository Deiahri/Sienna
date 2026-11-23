import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { buildComponents } from "./components";
import { remarkCustomDirectives } from "./plugins/remarkCustomDirectives";
import type { MarkdownArticleProps } from "./types";

/**
 * Renders an article from a markdown string.
 *
 * Note the absence of `"use client"`. Every custom element this renders —
 * coloured spans, YouTube iframes, native video, artifact links — is static
 * markup, so the whole pipeline stays on the server and none of the ~130 kB of
 * markdown parser reaches the browser.
 *
 * Width is deliberately unconstrained: the root `<article>` fills its parent
 * and the host page decides the measure.
 */
export function MarkdownArticle({
  markdown,
  resolveArtifact,
  className,
}: MarkdownArticleProps) {
  return (
    <article className={className ? `md-article ${className}` : "md-article"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCustomDirectives]}
        rehypePlugins={[rehypeSlug]}
        components={buildComponents({ resolveArtifact })}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
