import { site } from "@/site.config";

/**
 * Her resume, opened where it's hosted (a Google Drive share, say) in a new tab. Until there's a
 * link, a quiet "Resume (soon)" that isn't a link at all, so nobody clicks into nothing.
 */
export default function ResumeLink({ className = "" }: { className?: string }) {
  if (!site.resumeUrl) {
    return (
      <span className={`cursor-default text-muted ${className}`} aria-disabled="true" title="Coming soon">
        Resume <span className="text-muted/80">(soon)</span>
      </span>
    );
  }
  return (
    <a href={site.resumeUrl} target="_blank" rel="noopener noreferrer" className={`link ${className}`}>
      Resume
    </a>
  );
}
