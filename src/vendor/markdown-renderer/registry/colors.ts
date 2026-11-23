/**
 * The colour vocabulary available to authors via `:color[…]{val=…}`.
 *
 * These are *token names*, not values. Each one is mapped to a design token by
 * the host site — see the `.md-color[data-color=…]` rules in
 * src/components/Article.module.css, which resolve them against
 * src/styles/tokens.css. The renderer's own article.css was not vendored.
 *
 * Because authors never write a literal colour, a future dark palette reaches
 * these for free. That palette does not exist yet; see todo.md.
 */
export const COLOR_TOKENS = [
  "primary",
  "secondary",
  "accent",
  "muted",
  "success",
  "warning",
  "danger",
  "info",
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

const TOKEN_SET: ReadonlySet<string> = new Set(COLOR_TOKENS);

export function isColorToken(value: unknown): value is ColorToken {
  return typeof value === "string" && TOKEN_SET.has(value);
}
