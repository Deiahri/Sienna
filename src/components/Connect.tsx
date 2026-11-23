import { LuGithub, LuLinkedin, LuMail } from "react-icons/lu";
import { email, mailto, site } from "@/site.config";
import CopyEmail from "./CopyEmail";
import { pill } from "./pill";
import Reveal from "./Reveal";
import ResumeLink from "./ResumeLink";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

/**
 * How to reach her. Email is the one thing to do here, so it's the one solid button (a mailto with
 * the subject filled in), with the address beside it to copy. Her profiles and resume are the
 * outlined buttons under it.
 */
export default function Connect() {
  return (
    <section id="connect" aria-labelledby="connect-head" className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
      <Reveal>
        <SectionHead id="connect-head">Connect</SectionHead>
        <p className="max-w-prose text-lg leading-relaxed text-ink-soft">
          <Rich text={site.connect.line} />
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
          <a
            href={mailto}
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-sienna-deep [&_svg]:size-[1.125rem]"
            data-probe="mailto"
          >
            <LuMail aria-hidden="true" />
            Email me
          </a>
          <span className="flex items-center gap-1">
            <span className="break-all text-ink-soft select-all">{email}</span>
            <CopyEmail email={email} />
          </span>
        </div>

        <ul className="mt-6 flex flex-wrap gap-3">
          <li>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={`${pill} hover:border-ink`}>
              <LuLinkedin aria-hidden="true" />
              LinkedIn
            </a>
          </li>
          <li>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className={`${pill} hover:border-ink`}>
              <LuGithub aria-hidden="true" />
              GitHub
            </a>
          </li>
          <li>
            <ResumeLink variant="pill" />
          </li>
        </ul>
      </Reveal>
    </section>
  );
}
