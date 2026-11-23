"use client";

import { usePostHog } from "@posthog/react";
import { useEffect } from "react";
import { analyticsEnabled } from "./config";
import { useConsentContext } from "./ConsentContext";

/**
 * PostHog, once the visitor has said yes; otherwise nothing, and `posthog?.capture(...)` at the
 * call sites does nothing either. With no key configured PostHog is never touched at all.
 */
export default function useAnalytics() {
  const posthog = usePostHog();
  const { hasConsent } = useConsentContext();

  useEffect(() => {
    if (!analyticsEnabled) return;
    if (hasConsent) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  }, [hasConsent, posthog]);

  if (!analyticsEnabled || !hasConsent) return {};
  return { posthog };
}
