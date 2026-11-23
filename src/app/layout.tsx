import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import AnalyticsBanner from "@/components/analytics/AnalyticsBanner";
import Providers from "@/components/analytics/Providers";
import { fullName, site } from "@/site.config";
import "./globals.css";

const sans = Instrument_Sans({ variable: "--font-instrument-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

/** Absolute URLs for the OG image and canonicals: SITE_URL, else Vercel's production domain. */
const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: fullName, template: `%s · ${fullName}` },
  description: site.description,
  openGraph: { siteName: fullName, title: fullName, description: site.description },
};

/**
 * Marks the page as scripted before it paints, so Reveal's sections start hidden only when the
 * script that shows them will run.
 */
const markJs = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Smooth scrolling is for the in-page anchors; this tells Next to switch it off for route changes.
    <html lang="en" className={`${sans.variable} ${serif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: markJs }} />
      </head>
      <body className="min-h-screen bg-paper text-ink">
        <Providers>
          {children}
          <AnalyticsBanner />
        </Providers>
      </body>
    </html>
  );
}
