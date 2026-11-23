import type { PortfolioCard } from "@/lib/types";
import Reveal from "./Reveal";
import ResumeLink from "./ResumeLink";
import SectionHead from "./SectionHead";
import WorkCard from "./WorkCard";

/**
 * Her projects, as she publishes them in the Brundain Writer, newest first. Until there are any
 * (or while the Writer is down), one honest line instead of an empty grid.
 */
export default function Work({ cards }: { cards: PortfolioCard[] }) {
  return (
    <section id="work" aria-labelledby="work-head" className="mx-auto w-full max-w-5xl scroll-mt-8 px-6 py-24 sm:px-10">
      <Reveal>
        <SectionHead id="work-head">Work</SectionHead>
      </Reveal>
      {cards.length === 0 ? (
        <Reveal>
          <p className="max-w-prose text-lg text-ink-soft" data-probe="work-empty">
            Project write-ups are on the way. In the meantime, there&apos;s my <ResumeLink />.
          </p>
        </Reveal>
      ) : (
        <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {cards.map((card, i) => (
            <li key={card.id}>
              <Reveal delay={(i % 2) * 120}>
                <WorkCard card={card} index={i} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
