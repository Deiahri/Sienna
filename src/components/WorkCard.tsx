/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatMonth } from "@/lib/format";
import { hrefFor, type PortfolioCard } from "@/lib/types";

/** The placeholder tints, warm and close to the paper. Picked by the card's place in the list. */
const TINTS = ["#efe7dc", "#e8e3da", "#f1e4da", "#e6e6df"];

/** One project: its cover (or a tinted block with the title's initial), then title, line and date. */
export default function WorkCard({ card, index }: { card: PortfolioCard; index: number }) {
  return (
    <Link href={hrefFor(card)} className="group block" data-probe="work-card">
      <div className="overflow-hidden rounded-xl">
        {card.coverUrl ? (
          <img
            src={card.coverUrl}
            alt=""
            className="aspect-[3/2] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="flex aspect-[3/2] w-full items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            style={{ background: TINTS[index % TINTS.length] }}
            data-probe="cover-placeholder"
            aria-hidden="true"
          >
            <span className="serif text-8xl text-sienna/60">{card.title.trim()[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-medium leading-snug decoration-line underline-offset-4 group-hover:underline">{card.title}</h3>
        <span className="shrink-0 text-sm text-muted tabular-nums">{formatMonth(card.date)}</span>
      </div>
      {card.subtitle && <p className="mt-1 text-ink-soft">{card.subtitle}</p>}
    </Link>
  );
}
