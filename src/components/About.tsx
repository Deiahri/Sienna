/* eslint-disable @next/next/no-img-element */
import { site } from "@/site.config";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/**
 * The outline's "Brief About": a photo beside school, major and graduation, what she does plus
 * something personal, and a couple of sentences. Short on purpose: the long version is the resume.
 */
export default function About() {
  const { facts, pairing, paragraphs } = site.about;
  return (
    <section id="about" aria-labelledby="about-head" className="mx-auto w-full max-w-5xl scroll-mt-8 px-6 py-24 sm:px-10">
      <Reveal>
        <SectionHead id="about-head">About</SectionHead>
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <Photo />
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted">{facts.join(" · ")}</p>
            <p className="mt-6 text-2xl leading-snug sm:text-3xl">
              {pairing.work}
              <span className="serif px-3 text-sienna" aria-hidden="true">
                +
              </span>
              <span className="sr-only">and</span>
              {pairing.personal.toLowerCase()}
            </p>
            <div className="mt-8 max-w-prose space-y-4 text-lg leading-relaxed text-ink-soft">
              {paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/** Her photo, or until there is one, a warm block with her initials. */
function Photo() {
  if (site.photo) {
    return <img src={site.photo} alt={`${site.name.first} ${site.name.last}`} className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl object-cover md:max-w-none" />;
  }
  return (
    <div className="mx-auto flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-2xl bg-paper-deep md:max-w-none" data-probe="photo-placeholder">
      <span className="serif text-7xl text-sienna/70">
        {site.name.first[0]}
        {site.name.last[0]}
      </span>
    </div>
  );
}
