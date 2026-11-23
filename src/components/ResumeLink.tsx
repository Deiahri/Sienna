import { LuFileText } from "react-icons/lu";
import { site } from "@/site.config";
import { pill } from "./pill";

/**
 * Her resume, opened where it's hosted (a Google Drive share, say) in a new tab. Until there's a
 * link, a quiet "(soon)" that isn't a link at all, so nobody clicks into nothing.
 *
 * `text` is a link among words (the nav, Work's empty note); `pill` is Connect's button.
 */
export default function ResumeLink({ variant = "text" }: { variant?: "text" | "pill" }) {
  if (variant === "pill") {
    if (!site.resumeUrl) {
      return (
        <span className={`${pill} cursor-default border-dashed text-muted`} aria-disabled="true" title="Coming soon">
          <LuFileText aria-hidden="true" />
          Resume <span className="text-muted/80">· soon</span>
        </span>
      );
    }
    return (
      <a href={site.resumeUrl} target="_blank" rel="noopener noreferrer" className={`${pill} hover:border-ink`}>
        <LuFileText aria-hidden="true" />
        Resume
      </a>
    );
  }
  if (!site.resumeUrl) {
    return (
      <span className="cursor-default text-muted" aria-disabled="true" title="Coming soon">
        Resume <span className="text-muted/80">(soon)</span>
      </span>
    );
  }
  return (
    <a href={site.resumeUrl} target="_blank" rel="noopener noreferrer" className="link">
      Resume
    </a>
  );
}
