"use client";

import { useEffect, useRef, useState } from "react";

import "./SectionNav.css";

interface Section {
  id: string;
  text: string;
}

/**
 * A write-up's sections beside it, so a reader can see its shape and jump to a part. Ported from
 * Junda's site (Kleos K6).
 *
 * It reads the `##` headings from the article in its own `.railed` block, with the ids the
 * renderer's rehype-slug already gave them, so the renderer stays a server component. The section
 * being read is marked. Wide screens only (see SectionNav.css): narrower, the rail would push the
 * write-up down.
 */
export function SectionNav() {
  const nav = useRef<HTMLElement>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const article = nav.current?.closest(".railed")?.querySelector("article");
    if (!article) return;
    const headings = [...article.querySelectorAll<HTMLHeadingElement>("h2[id]")];
    setSections(headings.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? "" })).filter((s) => s.text));
    if (headings.length === 0) return;

    // The section being read: the last heading that has passed a line a third of the way down.
    const pick = () => {
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const h of headings) if (h.getBoundingClientRect().top <= line) current = h.id;
      setActive(current ?? headings[0].id);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  return (
    <nav ref={nav} className="section-nav" aria-label="Sections" data-probe="section-nav">
      {sections.length > 1 && <p className="section-nav__label">On this page</p>}
      {sections.length > 1 && (
        <ol className="section-nav__list">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="section-nav__link"
                aria-current={s.id === active ? "location" : undefined}
                onClick={() => setActive(s.id)}
              >
                {s.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
