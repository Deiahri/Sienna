import Link from "next/link";
import { fullName } from "@/site.config";
import ResumeLink from "./ResumeLink";

/** The top bar: her name home, and Work, About and her resume. It scrolls away with the page. */
export default function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-sm sm:px-10">
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
    </header>
  );
}
