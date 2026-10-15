# CLAUDE.md — Mahnoor's Developer Portfolio

You are working in Mahnoor Siddiqui's portfolio repo. The goal is to move the site
from static HTML/CSS/JS to **Next.js + Payload CMS**, so every piece of content,
every contact message and every email can be managed from the Payload admin panel,
with no code changes needed for content.

Mahnoor is often away while you work. Work autonomously and keep going.

## Read these first, every session
1. `PLAN.md`: the phases and checkboxes. Do the first unchecked item.
2. `PROGRESS.md`: the log of what was done, what is blocked, and what is next.
   Create it if it doesn't exist.

## How to work (autonomy rules)
- **Don't ask for permission or confirmation unless it is truly necessary.** Make
  sensible decisions yourself, note them in `PROGRESS.md`, and keep going.
- **Only stop and ask when the action is one of these:**
  1. Irreversible or destructive: deleting the database, dropping tables in a
     shared or production database, force-pushing, rewriting git history, or
     deleting files you didn't create.
  2. Costs money or signs up for a service: buying a domain, paid plans, new accounts.
  3. Needs a secret only Mahnoor has, and no workaround exists.
  4. Touches production: deploying, changing the live Vercel project, or running
     migrations on the production database.
  5. Pushes to `master`/`main` or merges a PR.
- **When blocked on one of those:** write the exact question at the top of
  `PROGRESS.md` under `## Waiting for Mahnoor`, then continue with any other
  unblocked task in `PLAN.md`. Never sit idle waiting.
- **Missing secrets:** use placeholders in `.env.example` and keep building. If
  `DATABASE_URI` isn't set, use a local Postgres (Docker: `postgres:16`) if one is
  available. Otherwise do the frontend and other non-database work first.
- **Commit early and often** on the working branch `payload-migration`, with small,
  clear commit messages. Pushing that branch is fine. Never push to `master`.
- **Verify before ticking a box:** run `npm run build`, `npm run lint` and the dev
  server, and check the page in a browser or with a quick request. Only tick a
  `PLAN.md` box when its "Done when" is true.
- **End every work session** by updating `PROGRESS.md` (done / blocked / next),
  ticking boxes in `PLAN.md`, and committing.

## Stack and decisions (already agreed, don't change without asking)
- Next.js App Router + **Payload 3.x** (latest stable; do NOT use the v4 beta). TypeScript.
- PostgreSQL on **Neon** (`@payloadcms/db-postgres`).
- Hosting on **Vercel**. Uploads (images, CV PDF) go to **Vercel Blob**
  (`@payloadcms/storage-vercel-blob`). Never rely on the local filesystem in production.
- Email through **Resend** (`@payloadcms/email-resend`).
- Features: content control, messages inbox, email alert + client auto-reply,
  Live Preview, custom admin design, CV download, blog.
- **Not doing now:** testimonials, message analytics.

## Project layout (target)
```
legacy/                    old static site: reference only, don't edit
src/app/(frontend)/        public site: page.tsx, blog/, actions/
src/app/(payload)/         Payload admin + API (generated) + custom.scss
src/collections/           Projects, Skills, ProcessSteps, Experience, ContactOptions,
                           Messages, Posts, Media, Users
src/globals/               SiteSettings, EmailSettings
src/components/            section components + Effects.tsx (animations)
src/hooks/                 revalidate + email hooks
src/seed.ts                fills Payload with the current site content
```

## Rules for the frontend port
- The site must **look and move exactly like the legacy site**. Reuse
  `legacy/css/style.css`, and keep the same class names and ids.
- Keep the three colour "vibes" (violet/aqua/blush), the localStorage key
  `mahnoor-vibe`, the fonts (Syne, Unbounded, Space Grotesk, Instrument Sans via
  `next/font`) and every animation: loader, gravity letters, 3D orb, skill sphere,
  scroll effects, process track, rocket "back to top".
- Animation code (from `legacy/js/main.js`) runs in a client component inside
  `useEffect` with proper cleanup. Install the libraries from npm: gsap, three,
  matter-js, lenis.
- No hard-coded content. Every text, link and list comes from Payload. Sections
  with no content hide themselves (blog link, CV button, empty lists).
- Pages are static. `afterChange`/`afterDelete` hooks call `revalidatePath`, so
  edits go live without visitors waiting on the database.
- Accessibility: keep the existing aria attributes, `prefers-reduced-motion`
  handling and keyboard support.

## Security rules
- `Messages`: no public create/read through the API. Messages are created only by
  the contact form's Server Action (zod validation, honeypot, max 5 per IP per
  hour) with `overrideAccess: true`. Only logged-in admins can read them.
- `EmailSettings`: admin-only.
- Public read access only for published content.
- Never commit `.env`. Keep `.env.example` up to date with every variable.
- Don't read or print `.env` values in logs or commits.

## Useful commands
- `npm run dev`: dev server (site at `/`, admin at `/admin`)
- `npm run build`, `npm run lint`
- `npx payload generate:types` after any schema change
- `npx payload run src/seed.ts`: seed content (safe to re-run: skips existing data)
- `npx payload migrate:create`: create a migration before production

## Owner info (for seed data)
- Name: Mahnoor Siddiqui · Email: mahnoorrr41@gmail.com
- GitHub: https://github.com/mahnoor986 · LinkedIn: https://www.linkedin.com/in/mahnoor-siddiqui-tech/
- All other content: copy it exactly from `legacy/index.html`.