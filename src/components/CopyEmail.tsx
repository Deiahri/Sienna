"use client";

import { useState } from "react";
import useAnalytics from "./analytics/useAnalytics";

/** Copies her address, for anyone whose mail isn't the browser's default handler. */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const { posthog } = useAnalytics();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      posthog?.capture("email_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address is on screen to select by hand.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      aria-live="polite"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
