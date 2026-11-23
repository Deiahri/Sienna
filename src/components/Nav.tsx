import Link from "next/link";
import { fullName } from "@/site.config";
import ResumeLink from "./ResumeLink";

/**
 * The top bar: her name home, and Work, About and her resume. It stays at the top, on the paper,
 * with a hairline under it. In-page jumps land below it (scroll-padding-top in globals.css).
 */
export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-5xl items-center justify-between px-6 text-sm sm:px-10">
        <Link href="/" className="font-medium tracking-tight">
          {fullName}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 text-ink-soft sm:gap-7">
          <Link href="/#work" className="link">
            Work
          </Link>
          <Link href="/#about" className="link">
            About
          </Link>
          <ResumeLink />
        </nav>
      </div>
    </header>
  );
}
