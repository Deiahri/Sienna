import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import NotFoundTracker from "@/components/analytics/NotFoundTracker";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center" data-probe="not-found">
        <p className="serif text-6xl">Nothing here.</p>
        <p className="mt-4 text-ink-soft">That page doesn&apos;t exist, or isn&apos;t published yet.</p>
        <Link href="/" className="link mt-8">
          Back to the start
        </Link>
        <NotFoundTracker />
      </main>
      <Footer />
    </>
  );
}
