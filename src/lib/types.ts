/**
 * What the Brundain Writer's public portfolio API answers with (SOT Writer Workspace,
 * server/portfolios/routes.ts). Mirrored here rather than imported: the two deploy separately.
 * Copied from portfolio-gael (Kleos, 2026-11-14), trimmed to the one category this site reads.
 */
export type PortfolioKind = "project";

export interface PortfolioCard {
  id: string;
  kind: PortfolioKind;
  title: string;
  subtitle: string | null;
  /** An absolute http(s) URL, or null for the generated placeholder. */
  coverUrl: string | null;
  /** YYYY-MM-DD: the date Sienna set, else the day the doc was created. */
  date: string;
  updatedAt: string;
}

export interface PortfolioWriteup extends PortfolioCard {
  /** Markdown with the renderer's directives, exactly as the Writer saved it. */
  content: string;
}

export function hrefFor(card: Pick<PortfolioCard, "id">): string {
  return `/projects/${card.id}`;
}
