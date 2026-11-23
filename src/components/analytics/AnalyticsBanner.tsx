"use client";

import Link from "next/link";
import { analyticsEnabled } from "./config";
import { useConsentContext } from "./ConsentContext";

/**
 * The cookie question, at the bottom until it's answered. Gael's banner (Kleos, 2026-11-14) in this
 * site's look. Only with a PostHog key; without one there's nothing to ask about.
 */
export default function AnalyticsBanner() {
  const { hasConsent, ready, setHasConsent } = useConsentContext();
  // Shown only once the stored answer is known, so a returning visitor never sees it flash.
  if (!analyticsEnabled || !ready || hasConsent !== undefined) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border border-line bg-paper px-5 py-4 text-sm shadow-[0_8px_30px_rgb(28_26_23/0.08)] sm:flex-row">
        <p className="flex-1 text-ink-soft">
          May I count visits, anonymously, to improve this site?{" "}
          <Link href="/privacy" className="link">
            Privacy
          </Link>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setHasConsent(false)} className="rounded-full px-4 py-1.5 text-ink-soft hover:text-ink">
            No thanks
          </button>
          <button type="button" onClick={() => setHasConsent(true)} className="rounded-full bg-ink px-4 py-1.5 text-paper hover:bg-ink-soft">
            Sure
          </button>
        </div>
      </div>
    </div>
  );
}
