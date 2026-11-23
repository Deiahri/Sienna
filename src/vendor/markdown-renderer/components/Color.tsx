import type { ReactNode } from "react";
import { isColorToken } from "../registry/colors";

interface ColorProps {
  /** Colour token name, e.g. `primary`. */
  val?: string;
  /** `text` for the inline form, `container` for the `:::` block form. */
  kind?: string;
  children?: ReactNode;
}

/**
 * `:color[text]{val=primary}` inline, or `:::color{val=primary}` around blocks.
 *
 * Emits a token name as `data-color`, never a literal colour. `article.css`
 * maps each token to a CSS custom property, so the host site owns the palette
 * and dark mode needs no changes here. An unrecognised token drops the
 * attribute and the text simply inherits its surrounding colour.
 */
export function Color({ val, kind, children }: ColorProps) {
  const token = isColorToken(val) ? val : undefined;

  if (kind === "container") {
    return (
      <div className="md-color" data-color={token}>
        {children}
      </div>
    );
  }

  return (
    <span className="md-color" data-color={token}>
      {children}
    </span>
  );
}
