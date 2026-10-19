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
- [x] Global `SiteSettings` with tabs: General/SEO (title, description, default vibe, available yes/no, availability text) · Hero (intro, muted intro, tagline, year, marquee words) · About (manifesto, about text, photo, photo alt, facts[value,label]) · Sections (work intro, toolkit heading/text, FE/BE/Tools texts, currently exploring, process intro, experience intro) · Contact (heading, heading lead, heading accent, subtext, options label, form note, success message, location) · Links (email, GitHub, LinkedIn, footer text) · CV (PDF upload + button label)
- [x] Global `EmailSettings` (admin-only): notify email, auto-reply on/off, subject, body
- [x] `Projects`: title, category, year, description, tags, image, image position, primary/secondary link label+URL, drafts, orderable
- [x] `Skills`: name, blurb, category (fe/be/tl), orderable
- [x] `ProcessSteps`: title, description, tags, orderable
- [x] `Experience`: period, title, organization, description, orderable
- [x] `ContactOptions`: label, visible, orderable
- [x] `Messages`: name, email, projectType, message, status (new/read/replied/spam/archived), notes, pageUrl, ipHash, createdAt. Read-only except status and notes. No public create/read.
- [x] `Posts`: title, slug, excerpt, cover, content (Lexical with code blocks + images), tags, publishedAt, drafts + autosave
- [x] `Media`: images + PDF, Vercel Blob adapter (enabled only when `BLOB_READ_WRITE_TOKEN` is set, so local dev still works)
- [x] Access rules: public reads published content only
- [x] `npx payload generate:types`

**Done when:** every section of `legacy/index.html` has a matching place in the admin.

## Phase 2 — Seed
- [x] `src/seed.ts` copies all content from `legacy/index.html` (texts, 4 projects, 26 skills, 5 steps, 2 jobs, 5 contact options, links) and uploads the avatar + 4 project images
- [x] Seed is safe to re-run (skips existing data)

**Done when:** the admin shows exactly what the old site shows.

## Phase 3 — Frontend port (largest phase)
- [x] Layout with `next/font` (Syne, Unbounded, Space Grotesk, Instrument Sans) + legacy CSS as global CSS + the vibe init script (localStorage `mahnoor-vibe`, falls back to the default vibe from SiteSettings)
- [x] Server components: Header, MobileMenu, Loader, Hero, Marquee, About, Work, Toolkit, Process, Experience, Contact, Footer. Same class names and ids as legacy.
- [x] All content from the Payload Local API, nothing hard-coded
- [x] `Effects.tsx` client component with `main.js` logic in `useEffect` + cleanup; libraries from npm; skill-sphere words come from Skills data
- [x] Project images through each project's image URL (replacing the `.art-1..4` CSS images)
- [x] Revalidation hooks on all collections/globals (`revalidatePath('/')`, and `/blog` for posts)
- [x] SEO metadata from SiteSettings

**Done when:** side by side with `legacy/index.html` the page looks and animates the same, `npm run build` passes, and editing a text in the admin changes the site.

## Phase 4 — Contact form + inbox
- [x] Client form component → Server Action `sendMessage`
- [x] zod validation (name ≤120 chars, no `<>`; valid email; message 1–5000 chars), honeypot, max 5 per IP per hour (hashed IP), create with `overrideAccess: true`
- [x] Options from ContactOptions, notes/success text from SiteSettings, same error styling as legacy
- [x] Admin list: newest first, columns status/date/name/type

**Done when:** a test message appears in the admin; invalid input and the honeypot are rejected.

## Phase 5 — Emails (Resend)
- [x] `resendAdapter` in `payload.config.ts` (skip gracefully if there's no API key in dev)
- [x] `Messages` afterChange (create): alert to notify email (reply-to = client, link to the admin item) + auto-reply "Hi {name}, …" if enabled
- [x] Send with Next `after()` so the form responds fast; log failures and don't throw

**Done when:** with a real key, the alert arrives (and the auto-reply too, once the domain is verified).
_(Code done and tested without a key and with an invalid key. Final check waits for Mahnoor's `RESEND_API_KEY`.)_

## Phase 6 — Live Preview
- [x] `admin.livePreview` for site-settings, projects and posts, with Mobile/Tablet/Desktop breakpoints
- [x] Drafts + autosave (short interval) on those
- [x] `/api/preview` route (secret) → Next `draftMode`; pages fetch with `draft: true` in draft mode
- [x] `RefreshRouteOnSave` (`@payloadcms/live-preview-react`) in the layout

**Done when:** editing a hero text or project in the admin updates the preview pane.

## Phase 7 — CV download
- [x] "Download CV" button (hero, mobile menu, contact card) linking to the uploaded PDF; hidden when there's no CV

**Done when:** uploading a new PDF changes the download.

## Phase 8 — Blog
- [x] `/blog` list (cover, title, date, tags, excerpt) in portfolio style
- [x] `/blog/[slug]` with Lexical rendering, styled headings/images/code blocks, `generateStaticParams`, `generateMetadata`
- [x] Blog link in the menu + optional "Latest posts" strip on the home page, hidden when there are 0 published posts

**Done when:** publishing a post shows it; unpublishing hides it.

## Phase 9 — Admin design ("Night Studio", see `design/ADMIN_DESIGN.md` + `design/admin-prototype.dc.html`)
Build in this order, commit after each. Check each against the prototype's CSS/markup in all three vibes,
at desktop and 390px wide, with real Payload data; keep access rules, hooks and Live Preview working.
- [x] Tokens / `custom.scss` (vibes on `html[data-vibe]`, fonts, Payload variables, buttons/inputs/tabs/tables, no scrollbars), `admin.theme: 'dark'`, `admin.meta`
- [x] Sticky Nav + logo (mask "mahnoor" letters, ADMIN chip, groups with counts, active pill, user card + logout)
- [x] Top bar (global search, vibe switcher saved as `mahnoor-admin-vibe`, View site)
- [x] Dashboard (greeting, Available toggle, 4 stat cards, latest messages, quick actions, site at a glance)
- [x] Inbox (status filters with counts, search, split list/reading pane, auto Read, Reply by email → Replied, delete, status pills, autosaving notes)
- [x] Site settings (pill tabs, save state text, Contact heading preview, CV empty/uploaded states)
- [x] Projects (card list: thumbnail, status chip, ↑/↓ order, Publish/Unpublish, Edit, Delete, filters, search; edit view styled, Live Preview kept)
- [x] Skills (inline edit, add, delete, ↑/↓, category filter, search)
- [x] Process steps (inline edit, add, delete, ↑/↓)
- [x] Experience (inline edit, add, delete, ↑/↓)
- [x] Contact options (inline rename, add, delete, ↑/↓, show/hide switch, "on your site" preview)
- [ ] Blog posts (card list, filter pills, "No posts yet" empty state; Payload editor + Live Preview)
- [ ] Media (grid, All/Images/PDFs filters, search, upload, delete blocked when in use)
- [ ] Email settings (email preview card that updates while typing, "Send me a test email")
- [ ] Users (rows with initials avatar, role chip, status chip)
- [ ] Toasts (orchid pill, bottom centre, Undo for deletes where possible)

**Done when:** the admin matches the portfolio's look.

## Phase 10 — Deploy (ask Mahnoor before touching production)
- [ ] Migrations created (`payload migrate:create`); build command runs `payload migrate && next build`
- [ ] Deployment checklist written in `README.md` (env vars, Neon, Blob, Resend domain)
- [ ] After approval: deploy, seed production, final checks (Lighthouse, mobile, form → emails, Live Preview, CV)

**Done when:** the live site runs fully from Payload.
