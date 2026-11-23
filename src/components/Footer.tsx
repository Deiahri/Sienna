import { cacheLife } from "next/cache";
import Link from "next/link";
import { fullName } from "@/site.config";
import { analyticsEnabled } from "./analytics/config";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-10 text-sm text-muted sm:px-10">
      <p>
        © <Year /> {fullName}
      </p>
      {analyticsEnabled && (
        <Link href="/privacy" className="link">
          Privacy
        </Link>
      )}
    </footer>
  );
}

/** The year, read when the page is prerendered and again at most daily (Cache Components forbids a bare `new Date()`). */
async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
