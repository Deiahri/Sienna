"use client";

import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
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
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-muted transition-colors hover:bg-paper-deep hover:text-ink"
      aria-label={copied ? "Copied" : `Copy ${email}`}
    >
      {copied ? <LuCheck aria-hidden="true" className="size-3.5" /> : <LuCopy aria-hidden="true" className="size-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
