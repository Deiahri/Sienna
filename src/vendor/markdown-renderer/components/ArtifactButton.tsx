import type { ReactNode } from "react";
import { FiExternalLink } from "react-icons/fi";
import { safeUrl } from "../lib/url";
import { resolveIcon } from "../registry/icons";
import type { ArtifactResolver } from "../types";
import { DirectiveError } from "./DirectiveError";

interface ArtifactButtonProps {
  /** An artifact *name* to look up, or a literal URL. */
  src?: string;
  /** Icon name from the registry. */
  icon?: string;
  /** Fallback label when the directive has no `[content]`. */
  label?: string;
  children?: ReactNode;
  resolveArtifact?: ArtifactResolver;
}

/**
 * `::artifact_b[Read the spec]{src="onboarding-spec" icon=code}`
 *
 * Opens a PDF or link in a new tab. `src` is looked up through the host site's
 * resolver first and only treated as a literal URL if that misses, so authors
 * can write stable names and the site can move the underlying files.
 *
 * It renders as an `<a>`, not a `<button>` — it navigates, so it should be
 * middle-clickable and copyable, and it needs no JavaScript.
 */
export function ArtifactButton({
  src,
  icon,
  label,
  children,
  resolveArtifact,
}: ArtifactButtonProps) {
  if (!src) {
    return <DirectiveError message="artifact_b: missing src" />;
  }

  const resolved = resolveArtifact?.(src);
  const href = safeUrl(resolved?.href ?? src);
  if (!href) {
    return <DirectiveError message={`artifact_b: cannot resolve ${JSON.stringify(src)}`} />;
  }

  const Icon = resolveIcon(icon);
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  const text = hasChildren ? children : (label ?? resolved?.label ?? src);

  return (
    <a
      className="md-artifact"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="md-artifact__icon" aria-hidden="true" />
      <span className="md-artifact__label">{text}</span>
      <FiExternalLink className="md-artifact__ext" aria-hidden="true" />
      <span className="md-visually-hidden">(opens in a new tab)</span>
    </a>
  );
}
