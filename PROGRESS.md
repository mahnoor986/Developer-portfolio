# PROGRESS

## Waiting for Mahnoor
- Nothing blocking right now. Still needed later (see PLAN.md "Waiting on Mahnoor"):
  Neon `DATABASE_URI`, `RESEND_API_KEY`, a verified domain in Resend, Vercel project + Blob token.

## Log

### 2026-10-15 — Phase 1 (content model) ✅
**Done**
- Globals:  (tabs: General & SEO, Hero, About, Sections, Contact, Links, CV, Labels) and
   (admin-only).
- Collections: Projects (drafts, orderable), Skills, ProcessSteps, Experience, ContactOptions (all orderable),
  Messages, Posts (drafts + autosave, Lexical with code blocks + uploads, auto slug), Media (images + PDF), Users.
- Vercel Blob plugin, enabled only when  is set.
- Access helpers in . Types generated.

**Decisions**
- Every visible text is editable, including small interface labels (menu, gravity button, loader, ring texts),
  in a  tab whose defaults match the legacy site.
- Two-part headings ( + , e.g. "Selected" + "work"); a newline in  = .
- Tags are  fields with  (no separate tags collection).
- Messages:  is blocked for everyone (incl. admins); form fields have field-level create/update
  locked, so only  and  can change. Default sort newest first.
- ContactOptions: the public only sees  ones.
- Legacy has two LinkedIn URLs (menu: , contact card: );
  using the one from CLAUDE.md (the second).
-  is marked experimental in Payload 3.90 but is what the plan asks for.

**Verified**
- build ✓, lint ✓ (0 errors). REST as anonymous: content 200; messages/users/email-settings 403; POST /api/messages 403.
- Local API checks: drafts and hidden contact options are hidden from the public; admin can change message
  status/notes but not name/email/message; admins can't create messages; slug "Héllo Wörld: test!" → .
- Logged-in admin: all globals/collection pages render. Temporary test data and users were deleted.

### 2026-10-15 — Phase 0 (project setup) ✅
**Done**
- Branch `payload-migration` created from `master`.
- Static site moved to `legacy/` with `git mv` (index.html, _menutest.html, css/, js/, assets/, vendor/), so history is kept.
- Scaffolded with `create-payload-app@3.90.2` (blank, Postgres) in a temp folder, then copied into the repo root.
  Stack: Payload 3.90.2, Next 16.3.3, React 19.2.
- `.env.example` has every variable from CLAUDE.md. Local `.env` created with random secrets (not committed).
- `.gitignore` extended for Next.js/Payload; `.env*` stays ignored, `.env.example` is tracked.

**Decisions**
- `DATABASE_URI` (as in CLAUDE.md) instead of the template's `DATABASE_URL`.
- Local DB: Docker `postgres:16`, container `portfolio-postgres`, **port 5433** (5432 belongs to another
  project's container on this machine). `docker-compose.yml` describes the same container/volume.
- Removed template extras not needed for Vercel: Mongo docker-compose, Dockerfile, `.yarnrc`, demo `/my-route`.
  Test scripts switched from pnpm to npm.
- `eslint.config.mjs`: `eslint-config-next` 16 ships flat configs, so the template's `FlatCompat` setup crashed;
  now imports `eslint-config-next/core-web-vitals` + `/typescript` directly. `legacy/` is ignored by lint.
- `next dev` (Next 16) appends an "agent rules" block to CLAUDE.md. Kept it (it's re-added on every dev run);
  set `agentRules: false` in next.config.ts to stop that.
- npm 11 warns that esbuild/unrs-resolver install scripts aren't approved; build/lint/dev all work without them.

**Verified**
- `npm run build` ✓ · `npm run lint` ✓ (0 errors, 3 warnings in template tests)
- `npm run dev`: `/` 200, `/admin` 200 ("Dashboard - Payload"), Payload created its tables in Postgres.

## Next
- Phase 2: seed script.
