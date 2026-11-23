/**
 * "Sep 15, 2026" from "2026-09-15". Read as UTC, so the server and every visitor's browser print
 * the same day whatever their time zone.
 */
export function formatDate(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** "Oct 2026" from "2026-10-14", read as UTC like formatDate. */
export function formatMonth(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
