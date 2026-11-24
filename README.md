# Sienna Zhang's portfolio

Sienna's site: her name, a short About, her **projects**, a compact list of education, awards and
languages, and a way to reach her. Next.js on Vercel.

It replaces the one-page Tailwind site that was here before (still in git history). That site read as
AI-generated: a status badge, "Hi, I'm Sienna (Xinning Zhang).", a wall of text, chip-covered cards, a
grid backdrop, a contact form that sent nothing, and a resume button with no resume behind it. This
one is light and plain, and her projects come from what she writes.

## Where the projects come from

Nothing is written here. Sienna writes each project in the **Brundain Writer**, files it under the
**Project** category, and in its card sets a subtitle, a cover image URL (optional), a date and
**Published**.

- **The home page** lists her published projects, newest date first. A card with no cover gets a
  tinted block with the title's initial.
- **A project's page** is `/projects/<doc id>`. The body is rendered by the Writer's own markdown
  renderer, vendored in [src/vendor/markdown-renderer](src/vendor/markdown-renderer/README.md)
  (read-only here), so charts, pins, videos and pictures look as they do in the Writer. On screens
  80rem and wider its `##` sections sit in a rail on the left, and a click on a picture opens it
  full size.
- **Freshness:** cached and refreshed in the background every 10 seconds ([src/lib/writer.ts](src/lib/writer.ts)).
  Publishing, unpublishing or editing shows within about that, with no deploy.
- **Misses:** a draft or an unknown id is the 404 page.
- **Writer down, or nothing published yet:** Work says write-ups are on the way. The rest of the
  page stays up.

The Writer's endpoints are `GET /api/portfolios/:ownerId/writeups?kind=project` and
`GET /api/portfolios/:ownerId/writeups/:docId?kind=project`. Both are public and only answer with
published docs. This integration is the one Gael's site uses (`Deiahri/brundain-kleos-external-testing`,
`portfolio-gael`), and these files are copied from it: `src/lib/{types,writer,format}.ts`, the
vendored renderer, `WriteupArticle`, `SectionNav`, `ImageZoom` and `components/analytics/`.

## Run it

```bash
npm install
npm run dev -- -p 3003   # reads the Writer at WRITER_API_URL (default http://localhost:8787) as WRITER_OWNER_ID (default: Sienna's id)
npm run build && npm start
npm run lint
```

For a Writer to read, run it from the Kleos repo, seeded with her five old projects as sample docs:

```bash
cd "../../2026-11-14 - Project Kleos External Testing/SOT Writer Workspace"
npm run dev:sienna            # the Writer as Sienna, on data/sienna (seeded the first time; -- --reset to reseed)
npm run probe:sienna          # browser checks of this site against a throwaway Writer (27 checks)
```

The samples are her old site's project text, for development only. Her real write-ups are hers to write.

## Personal details

Everything about Sienna (name, title, About text, the Also list, email, links, resume) is in
[src/site.config.ts](src/site.config.ts) and nowhere else. Still to do:

- [ ] **Her photo:** add it to `public/` and set `photo`. Until then About shows her initials.
- [ ] **Copy:** the About and Connect text is a DRAFT from the outline and her old site.
- [ ] **Personal email:** set `personalEmail`. Until then the site uses her cougarnet address.
- [ ] **Resume:** set `resumeUrl` to a hosted PDF (e.g. a Google Drive share link). Until then
      it shows "Resume (soon)" with nothing to click.
- [x] **Her Project category:** made in her Writer account on 2026-11-24 (slug `project`, what this
      site asks for), with one unpublished "Project template" doc (lorem ipsum) under it. She
      writes a project there, or a new doc filed under Project, and publishes it to show it here.

## Deploying (Vercel)

1. **New project** from this repo, `main`. The framework is detected as Next.js.
2. **Environment variables** (see [.env.example](.env.example)):

| Variable | Value |
|---|---|
| `WRITER_API_URL` | The Writer's Railway URL, no trailing slash. |
| `WRITER_OWNER_ID` | Optional. Sienna's Clerk user id is the default. |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Optional. Without them there's no consent banner and no tracking. Inlined at build. |
| `SITE_URL` | Optional, for a custom domain. Otherwise Vercel's production domain is used. |

3. **After merging into `Ning-xxxnnn/Sienna`, turn GitHub Pages off** there. Pages can't run this site,
   and Vercel's URL replaces `ning-xxxnnn.github.io/Sienna`.

## How it's built

- **Next 16.4, Cache Components on**, as in Gael's site. The Writer reads use `"use cache"` with
  `cacheLife({ stale: 300, revalidate: 10, expire: 3600 })`. Project pages have no
  `generateStaticParams` (no id is known at build) and stream the doc in inside `<Suspense>`.
- **The look:** tokens are in [src/app/globals.css](src/app/globals.css) (paper, ink, one sienna
  accent; Instrument Sans with Instrument Serif italic). Sections rise in once as they scroll into
  view ([src/components/Reveal.tsx](src/components/Reveal.tsx)), never with reduced motion.
- **Server-only markdown:** the renderer runs only on the server ([src/components/WriteupArticle.tsx](src/components/WriteupArticle.tsx)).
  Its colours for this site are in `WriteupArticle.css`.
