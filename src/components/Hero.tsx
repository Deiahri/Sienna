import { fullName, site } from "@/site.config";

/** The outline's hero: her name and what she is, with room around them. Then a nudge down. */
export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center px-6 text-center">
      <h1 className="serif text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.95]">{fullName}</h1>
      <p className="mt-5 text-base tracking-wide text-ink-soft sm:text-lg">{site.title}</p>
      <a
        href="#about"
        aria-label="Scroll to About"
        className="drift absolute bottom-10 flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-ink"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 2v13M3.5 9.5 9 15l5.5-5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
