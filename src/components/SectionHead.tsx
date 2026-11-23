/** A section's name in the serif italic, with a hairline running off to the right. */
export default function SectionHead({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className="mb-10 flex items-baseline gap-5">
      <h2 id={id} className="serif shrink-0 text-4xl sm:text-5xl">
        {children}
      </h2>
      <span className="h-px flex-1 translate-y-[-0.35rem] bg-line" aria-hidden="true" />
    </div>
  );
}
