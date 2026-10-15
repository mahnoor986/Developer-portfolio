# PLAN — Portfolio → Next.js + Payload

Work top to bottom. Tick `[x]` only when the step's **Done when** is true.
Log details in `PROGRESS.md`. Branch: `payload-migration`.

## Waiting on Mahnoor (do NOT block on these: continue with other work)
- [ ] Neon database created and `DATABASE_URI` added to `.env` (local Postgres works until then)
- [ ] Resend account + `RESEND_API_KEY`
- [ ] Own domain bought and verified in Resend (needed only for the client auto-reply;
      `onboarding@resend.dev` can email only her own Resend address)
- [ ] Vercel project + Vercel Blob token (Phase 10)

## Phase 0 — Project setup
- [x] Create branch `payload-migration`
- [x] Move the current static site into `legacy/` (index.html, css/, js/, assets/, vendor/)
- [x] Scaffold Next.js + Payload 3.x with `create-payload-app` (blank template, PostgreSQL) in the repo root
- [x] `.env.example` with `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `PREVIEW_SECRET`
- [x] Update `.gitignore` for Next.js (`.next/`, `node_modules/`, `.env`, but keep `.env.example`)

**Done when:** `npm run dev` starts and `/admin` opens and connects to the database.

## Phase 1 — Content model
- [ ] Global `SiteSettings` with tabs: General/SEO (title, description, default vibe, available yes/no, availability text) · Hero (intro, muted intro, tagline, year, marquee words) · About (manifesto, about text, photo, photo alt, facts[value,label]) · Sections (work intro, toolkit heading/text, FE/BE/Tools texts, currently exploring, process intro, experience intro) · Contact (heading, heading lead, heading accent, subtext, options label, form note, success message, location) · Links (email, GitHub, LinkedIn, footer text) · CV (PDF upload + button label)
- [ ] Global `EmailSettings` (admin-only): notify email, auto-reply on/off, subject, body
- [ ] `Projects`: title, category, year, description, tags, image, image position, primary/secondary link label+URL, drafts, orderable
- [ ] `Skills`: name, blurb, category (fe/be/tl), orderable
- [ ] `ProcessSteps`: title, description, tags, orderable
- [ ] `Experience`: period, title, organization, description, orderable
- [ ] `ContactOptions`: label, visible, orderable
- [ ] `Messages`: name, email, projectType, message, status (new/read/replied/spam/archived), notes, pageUrl, ipHash, createdAt. Read-only except status and notes. No public create/read.
- [ ] `Posts`: title, slug, excerpt, cover, content (Lexical with code blocks + images), tags, publishedAt, drafts + autosave
- [ ] `Media`: images + PDF, Vercel Blob adapter (enabled only when `BLOB_READ_WRITE_TOKEN` is set, so local dev still works)
- [ ] Access rules: public reads published content only
- [ ] `npx payload generate:types`

**Done when:** every section of `legacy/index.html` has a matching place in the admin.

## Phase 2 — Seed
- [ ] `src/seed.ts` copies all content from `legacy/index.html` (texts, 4 projects, 26 skills, 5 steps, 2 jobs, 5 contact options, links) and uploads the avatar + 4 project images
- [ ] Seed is safe to re-run (skips existing data)

**Done when:** the admin shows exactly what the old site shows.

## Phase 3 — Frontend port (largest phase)
- [ ] Layout with `next/font` (Syne, Unbounded, Space Grotesk, Instrument Sans) + legacy CSS as global CSS + the vibe init script (localStorage `mahnoor-vibe`, falls back to the default vibe from SiteSettings)
- [ ] Server components: Header, MobileMenu, Loader, Hero, Marquee, About, Work, Toolkit, Process, Experience, Contact, Footer. Same class names and ids as legacy.
- [ ] All content from the Payload Local API, nothing hard-coded
- [ ] `Effects.tsx` client component with `main.js` logic in `useEffect` + cleanup; libraries from npm; skill-sphere words come from Skills data
- [ ] Project images through each project's image URL (replacing the `.art-1..4` CSS images)
- [ ] Revalidation hooks on all collections/globals (`revalidatePath('/')`, and `/blog` for posts)
- [ ] SEO metadata from SiteSettings

**Done when:** side by side with `legacy/index.html` the page looks and animates the same, `npm run build` passes, and editing a text in the admin changes the site.

## Phase 4 — Contact form + inbox
- [ ] Client form component → Server Action `sendMessage`
- [ ] zod validation (name ≤120 chars, no `<>`; valid email; message 1–5000 chars), honeypot, max 5 per IP per hour (hashed IP), create with `overrideAccess: true`
- [ ] Options from ContactOptions, notes/success text from SiteSettings, same error styling as legacy
- [ ] Admin list: newest first, columns status/date/name/type

**Done when:** a test message appears in the admin; invalid input and the honeypot are rejected.

## Phase 5 — Emails (Resend)
- [ ] `resendAdapter` in `payload.config.ts` (skip gracefully if there's no API key in dev)
- [ ] `Messages` afterChange (create): alert to notify email (reply-to = client, link to the admin item) + auto-reply "Hi {name}, …" if enabled
- [ ] Send with Next `after()` so the form responds fast; log failures and don't throw

**Done when:** with a real key, the alert arrives (and the auto-reply too, once the domain is verified).

## Phase 6 — Live Preview
- [ ] `admin.livePreview` for site-settings, projects and posts, with Mobile/Tablet/Desktop breakpoints
- [ ] Drafts + autosave (short interval) on those
- [ ] `/api/preview` route (secret) → Next `draftMode`; pages fetch with `draft: true` in draft mode
- [ ] `RefreshRouteOnSave` (`@payloadcms/live-preview-react`) in the layout

**Done when:** editing a hero text or project in the admin updates the preview pane.

## Phase 7 — CV download
- [ ] "Download CV" button (hero, mobile menu, contact card) linking to the uploaded PDF; hidden when there's no CV

**Done when:** uploading a new PDF changes the download.

## Phase 8 — Blog
- [ ] `/blog` list (cover, title, date, tags, excerpt) in portfolio style
- [ ] `/blog/[slug]` with Lexical rendering, styled headings/images/code blocks, `generateStaticParams`, `generateMetadata`
- [ ] Blog link in the menu + optional "Latest posts" strip on the home page, hidden when there are 0 published posts

**Done when:** publishing a post shows it; unpublishing hides it.

## Phase 9 — Admin design
- [ ] `admin.meta` (title suffix "· Mahnoor", favicon), Logo/Icon components using the "mahnoor" letters
- [ ] `custom.scss`: vibe colours, fonts, dark mode as default
- [ ] `beforeDashboard`: welcome card with "X new messages", quick links (Edit homepage, New post, Upload CV), View site
- [ ] Status badge cell for Messages, thumbnail cell for Projects

**Done when:** the admin matches the portfolio's look.

## Phase 10 — Deploy (ask Mahnoor before touching production)
- [ ] Migrations created (`payload migrate:create`); build command runs `payload migrate && next build`
- [ ] Deployment checklist written in `README.md` (env vars, Neon, Blob, Resend domain)
- [ ] After approval: deploy, seed production, final checks (Lighthouse, mobile, form → emails, Live Preview, CV)

**Done when:** the live site runs fully from Payload.