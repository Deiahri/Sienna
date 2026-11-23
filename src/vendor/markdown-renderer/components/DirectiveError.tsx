/**
 * Shown in place of a directive that parsed but can't render — a missing `src`,
 * an unresolvable artifact name, a rejected URL scheme.
 *
 * Loud in development so the author notices while writing; renders nothing in
 * production so a bad directive degrades to an omission rather than a broken
 * page.
 */
export function DirectiveError({ message }: { message: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className="md-directive-error" role="note">
      {message}
    </span>
  );
}
