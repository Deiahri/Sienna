"use client";

import { useEffect, useRef } from "react";
import useAnalytics from "./useAnalytics";

/** Tells PostHog which address was missed, once (from Gael's NotFoundView). Draws nothing. */
export default function NotFoundTracker() {
  const { posthog } = useAnalytics();
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || !posthog) return;
    tracked.current = true;
    posthog.capture("page_not_found", { attempted_pathname: window.location.pathname });
  }, [posthog]);
  return null;
}
