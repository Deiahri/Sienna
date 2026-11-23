import { site } from "@/site.config";
import Reveal from "./Reveal";

/** The compact list below Work: education, awards, languages. Plain lines, no chips. */
export default function Also() {
  return (
    <section aria-label="Education, awards and languages" className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      <Reveal>
        <div className="grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
          {site.also.map((group) => (
            <div key={group.heading}>
              <h2 className="serif text-2xl">{group.heading}</h2>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.main}>
                    <p className="font-medium">{item.main}</p>
                    <p className="text-sm text-muted">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
