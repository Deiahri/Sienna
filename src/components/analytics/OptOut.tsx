"use client";

import { analyticsEnabled } from "./config";
import { useConsentContext } from "./ConsentContext";

/** The privacy page's switch, which changes the answer given to the banner. */
export default function OptOut() {
  const { hasConsent, setHasConsent } = useConsentContext();

  if (!analyticsEnabled) return <p className="text-muted">This site is not collecting analytics right now.</p>;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span>{hasConsent ? "You've opted in. Thank you." : "You've opted out."}</span>
      <button
        type="button"
        onClick={() => setHasConsent(!hasConsent)}
        className="rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink"
      >
        {hasConsent ? "Opt out" : "Opt in"}
      </button>
    </div>
  );
}
