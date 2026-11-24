import "server-only";

import { cacheLife } from "next/cache";
import type { PortfolioCard, PortfolioKind, PortfolioWriteup } from "./types";

/**
 * Sienna's projects, from the Brundain Writer. Copied from portfolio-gael (Kleos, 2026-11-14).
 *
 * Nothing here names a doc: the Writer lists whatever Sienna filed under Project and
 * published, so a new post shows up without a deploy. Both reads are cached for the whole site
 * and refreshed in the background (`cacheLife` below): the first view after an edit still gets the
 * old copy and starts the refresh, and the views after it get the new one. Within about 10 seconds
 * of publishing, unpublishing or editing, the site has caught up.
 *
 * Server-only: the browser never calls the Writer.
 */

/** Where the Writer runs. Unset, it is the Writer's local dev server. */
const WRITER_API_URL = (process.env.WRITER_API_URL || "http://localhost:8787").replace(/\/$/, "");

/**
 * Whose docs these are: the Clerk user id of Sienna's Writer account. `npm run dev:sienna` in the
 * Writer runs a local Writer as this same id, so locally there's nothing to set either.
 */
const WRITER_OWNER_ID = process.env.WRITER_OWNER_ID || "user_3MXcML9A45c4N9TADGBO5wKcET5";

/** Unset in production is a deploy mistake, not an outage: say so beside the failure. */
const MISSING_URL_HINT =
  !process.env.WRITER_API_URL && process.env.NODE_ENV === "production"
    ? " WRITER_API_URL is not set in this deployment's environment."
    : "";

/** Doc ids are UUIDs. Anything else is answered without asking the Writer, or caching a miss. */
const DOC_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * How both reads are cached (see `cacheLife`, "Prerendering behavior", in the Next docs):
 * - `revalidate: 10`: the server refetches from the Writer 10 s after the last fetch, in the
 *   background. This is what bounds how stale a page load can be.
 * - `stale: 300`: how long a browser tab may reuse what it already has on a client-side navigation
 *   (a reload always asks the server). Five minutes is the least that keeps the lists in the page's
 *   App Shell, so the home page needs no <Suspense> and its HTML stays in reading order.
 * - `expire: 3600`: an hour with no visits and the next one waits for a fresh copy.
 */
const WRITER_CACHE = { stale: 300, revalidate: 10, expire: 3600 };

const base = `${WRITER_API_URL}/api/portfolios/${encodeURIComponent(WRITER_OWNER_ID)}/writeups`;

/**
 * Published docs of one kind, newest first. An unreachable Writer is an empty list, logged, so the
 * home page stays up and its sections say there is nothing yet.
 */
export async function listWriteups(kind: PortfolioKind): Promise<PortfolioCard[]> {
  "use cache";
  cacheLife(WRITER_CACHE);

  const url = `${base}?kind=${kind}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[writer] the Writer answered ${res.status} for ${url}`);
      return [];
    }
    const body: { writeups: PortfolioCard[] } = await res.json();
    return body.writeups;
  } catch (err) {
    console.error(`[writer] the Writer could not be reached at ${url}.${MISSING_URL_HINT}`, err);
    return [];
  }
}

/**
 * One published doc of this kind, or null: a draft, an unpublished doc, a doc of the other kind,
 * someone else's, an unknown id, or the Writer down. The page turns null into its 404.
 */
export async function getWriteup(kind: PortfolioKind, id: string): Promise<PortfolioWriteup | null> {
  "use cache";
  cacheLife(WRITER_CACHE);

  if (!DOC_ID.test(id)) return null;
  const url = `${base}/${id}?kind=${kind}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status !== 404) console.error(`[writer] the Writer answered ${res.status} for ${url}`);
      return null;
    }
    const body: { writeup: PortfolioWriteup } = await res.json();
    return body.writeup;
  } catch (err) {
    console.error(`[writer] the Writer could not be reached at ${url}.${MISSING_URL_HINT}`, err);
    return null;
  }
}
