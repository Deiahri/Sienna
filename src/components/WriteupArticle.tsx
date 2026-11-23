import { MarkdownArticle } from "@/vendor/markdown-renderer";
import { ImageZoom } from "./ImageZoom";
import { SectionNav } from "./SectionNav";
import "./WriteupArticle.css";

/**
 * A project or a post from the Brundain Writer, read-only. A server component on purpose: the
 * markdown parses here and none of the parser reaches the browser. The only client code the
 * renderer ships is the chart, which loads when one is drawn (src/vendor/markdown-renderer/README.md,
 * rule 1). This is the only place that imports it.
 *
 * Kleos K6: on wide screens its sections sit in a rail to the left (SectionNav), and a click on a
 * picture opens it full size (ImageZoom), both ported from Junda's site. Each is a small client
 * component beside the article, never around it, so the renderer stays on the server. The article
 * keeps its 46rem: the rail only takes room there is to spare.
 */
export default function WriteupArticle({ markdown }: { markdown: string }) {
  return (
    <div className="railed">
      <aside className="rail">
        <SectionNav />
      </aside>
      <div className="railed__main">
        <MarkdownArticle markdown={markdown} className="writeup" />
        <ImageZoom />
      </div>
      <div aria-hidden="true" />
    </div>
  );
}
