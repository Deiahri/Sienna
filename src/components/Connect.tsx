import { email, mailto, site } from "@/site.config";
import CopyEmail from "./CopyEmail";
import Reveal from "./Reveal";
import ResumeLink from "./ResumeLink";
import SectionHead from "./SectionHead";

/** How to reach her: a line about what she's after, her address (a mailto, or copy it), her links. */
export default function Connect() {
  return (
    <section id="connect" aria-labelledby="connect-head" className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
      <Reveal>
        <SectionHead id="connect-head">Connect</SectionHead>
        <p className="max-w-prose text-lg leading-relaxed text-ink-soft">{site.connect.line}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={mailto} className="link break-all text-2xl sm:text-3xl" data-probe="mailto">
            {email}
          </a>
          <CopyEmail email={email} />
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-ink-soft">
          <li>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="link">
              GitHub
            </a>
          </li>
          <li>
            <ResumeLink />
          </li>
        </ul>
      </Reveal>
    </section>
  );
}
