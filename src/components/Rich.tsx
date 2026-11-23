/**
 * A line from site.config.ts with `**…**` drawn bold, in full ink so it stands out of the softer
 * text around it. That's the only markup: copy stays plain strings Sienna can edit.
 */
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
