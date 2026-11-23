"use client";

import { PostHogProvider } from "@posthog/react";
import type { ReactNode } from "react";
import { analyticsEnabled, POSTHOG_HOST, POSTHOG_KEY } from "./config";
import { ConsentProvider } from "./ConsentContext";

/** Consent always; PostHog only with a key, opted out until the visitor says yes. */
export default function Providers({ children }: { children: ReactNode }) {
  const inner = <ConsentProvider>{children}</ConsentProvider>;
  if (!analyticsEnabled) return inner;
  return (
    <PostHogProvider
      apiKey={POSTHOG_KEY}
      options={{
        api_host: POSTHOG_HOST,
        defaults: "2025-11-30",
        opt_out_capturing_by_default: true,
        cookieless_mode: "on_reject",
      }}
    >
      {inner}
    </PostHogProvider>
  );
}
