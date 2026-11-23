/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatMonth } from "@/lib/format";
import { getWriteup } from "@/lib/writer";
import { fullName } from "@/site.config";
import Footer from "./Footer";
import Nav from "./Nav";
import WriteupArticle from "./WriteupArticle";

/**
 * A project's page, written and published by Sienna in the Brundain Writer. Gael's WriteupPage
 * (Kleos, 2026-11-14), in this site's look.
 *
 * No id is known at build: whatever she publishes gets a page. So the id is read inside
 * <Suspense>, and Next serves the page's shell at once and streams the doc in. A doc that isn't
 * there (a draft, never existed) is the site's 404 page; found after streaming has begun, so the
 * status stays 200 with the noindex tag Next adds to every not-found render.
 */
export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Nav />
      <main className="pb-32">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
          {params.then(({ id }) => (
            <Project id={id} />
          ))}
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function Project({ id }: { id: string }) {
  const project = await getWriteup("project", id);
  if (!project) notFound();
  return (
    <article>
      {/* The article's own box (46rem, 1rem in from each side; WriteupArticle.css), so the two line up. */}
      <header className="mx-auto w-full max-w-[46rem] px-4 pt-10 pb-14 sm:pt-16">
        <Link href="/#work" className="link text-sm text-muted" data-probe="back">
          ← All work
        </Link>
        <p className="mt-12 text-sm text-muted tabular-nums">{formatMonth(project.date)}</p>
        <h1 className="mt-3 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{project.title}</h1>
        {project.subtitle && <p className="serif mt-5 text-2xl leading-snug text-ink-soft sm:text-3xl">{project.subtitle}</p>}
      </header>
      {project.coverUrl && (
        <img src={project.coverUrl} alt="" className="mx-auto mb-16 aspect-[16/9] w-[min(60rem,92vw)] rounded-2xl object-cover" />
      )}
      <WriteupArticle markdown={project.content} />
    </article>
  );
}

export async function projectMetadata(params: Promise<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const project = await getWriteup("project", id);
  if (!project) return { title: "Not found" };
  const description = project.subtitle ?? `A project by ${fullName}`;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: { title: project.title, description, ...(project.coverUrl ? { images: [project.coverUrl] } : {}) },
  };
}
