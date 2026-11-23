import type { ReactNode } from "react";

/** What an artifact name resolves to. `href` is the only required part. */
export interface ResolvedArtifact {
  href: string;
  /** Fallback label, used when the directive supplies neither content nor `label`. */
  label?: string;
}

/**
 * Turns an artifact *name* (`::artifact_b{src="onboarding-spec"}`) into a URL.
 *
 * Injected by the host site rather than baked in here, so this folder stays
 * portable. Return `undefined` for unknown names — the renderer then falls back
 * to treating `src` as a literal URL, and drops the button if that isn't safe.
 */
export type ArtifactResolver = (name: string) => ResolvedArtifact | undefined;

export interface MarkdownArticleProps {
  /** The raw markdown source. */
  markdown: string;
  resolveArtifact?: ArtifactResolver;
  /** Extra class on the root `<article>`, for host-side layout. */
  className?: string;
}

export interface ArticleComponentOptions {
  resolveArtifact?: ArtifactResolver;
}

/** Props every directive-backed component receives from react-markdown. */
export interface DirectiveProps {
  children?: ReactNode;
}
