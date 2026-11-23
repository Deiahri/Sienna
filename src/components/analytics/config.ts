/** PostHog is on only when this deployment has a key. Without one: no banner, no tracking. */
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
export const analyticsEnabled = POSTHOG_KEY !== "";
