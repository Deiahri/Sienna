import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import OptOut from "@/components/analytics/OptOut";
import { email, fullName } from "@/site.config";

export const metadata: Metadata = { title: "Privacy" };

const UPDATED = "November 23, 2026";

/** Gael's policy (Kleos, 2026-11-14), which says what this site's PostHog wiring does. */
const SECTIONS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: "What is collected",
    body: (
      <>
        <p>No names, email addresses or payment details.</p>
        <p>
          With your consent, this site uses PostHog, a product analytics service, to record limited usage data: pages visited,
          clicks, device type, browser, operating system, approximate location (city-level, from your IP address) and an anonymous
          identifier kept in a cookie or local storage.
        </p>
      </>
    ),
  },
  {
    title: "Why",
    body: <p>Only to see which pages are read, improve the site, and find bugs.</p>,
  },
  {
    title: "Third parties",
    body: (
      <>
        <p>
          PostHog is the only analytics provider, and it processes data under{" "}
          <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="link">
            its privacy policy
          </a>
          .
        </p>
        <p>The projects on this site are published from the Brundain Writer, which serves their text. Reading them sends it nothing about you.</p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: <p>If you accept analytics, PostHog uses a cookie or similar to recognize a returning visit. If you decline, it doesn&apos;t.</p>,
  },
  {
    title: "Your choice",
    body: (
      <p>
        Data is anonymous, so there is nothing specific to hand back on request. You can opt out any time with the switch below, with
        your browser&apos;s Do Not Track, or by writing to me.
      </p>
    ),
  },
  {
    title: "Contact",
    body: <p>Questions: {email}.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="serif text-5xl">Privacy</h1>
        <p className="mt-3 text-sm text-muted">
          {fullName} · Updated {UPDATED}
        </p>
        <div className="mt-12 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-medium">{section.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">{section.body}</div>
            </section>
          ))}
          <OptOut />
          <Link href="/" className="link inline-block">
            Back to the site
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
