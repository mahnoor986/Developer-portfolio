# PROGRESS

## Waiting for Mahnoor
- **Resend API key (finishes Phase 5).** Sign up at resend.com with **mahnoorrr41@gmail.com** (with the shared
  `onboarding@resend.dev` sender, Resend only delivers to the address the account was created with), create an
  API key, and add `RESEND_API_KEY=re_...` to `.env`. Then tell me and I'll send a test message and confirm the
  alert arrives. The auto-reply to visitors needs your own verified domain; leave it off until then.
- Still needed later (see PLAN.md "Waiting on Mahnoor"): Neon `DATABASE_URI`, a domain verified in Resend,
  Vercel project + Blob token.
- (Not blocking) Upload your CV PDF in Admin → Site settings → CV whenever you're ready.
- (Not blocking) The contact form texts now use my defaults ("I usually reply within a day or two." /
  "Thanks! Your message is on its way. I'll get back to you soon."). Change them any time in
  Admin → Site settings → Contact.

## Log

### 2026-10-15 — Phase 6 (Live Preview) ✅
**Done**
- `admin.livePreview` (`src/lib/preview.ts`) for Site settings, Projects and Posts, with Mobile (390×844),
  Tablet (820×1180) and Desktop (1440×900) breakpoints. Posts preview at `/blog/{slug}` (page comes in Phase 8).
- Drafts + autosave every 500 ms on Site settings, Projects and Posts (max 30 versions kept per document).
- `/api/preview` turns on Next draft mode only with the right `PREVIEW_SECRET` **and** a logged-in admin, and
  only redirects to same-site paths. `/api/exit-preview` turns it off.
- `src/lib/content.ts`: in draft mode the latest drafts are loaded (`draft: true`); visitors get published content.
  Contact options are always filtered to `visible`.
- `LivePreviewListener` (`RefreshRouteOnSave`) is rendered only in draft mode and refreshes the page on every
  (auto)save.
- Revalidation hooks ignore autosaved drafts; they rebuild the site when something is published, or when a
  published document is unpublished.

**Decisions**
- Enabling drafts on Site settings made the existing row a draft; I republished it (same content) with a one-off
  script, and the seed now publishes Site settings explicitly.
- Live Preview works when the admin is opened on the same address as `NEXT_PUBLIC_SERVER_URL` (the preview iframe
  and the "saved" messages are matched by that origin). In production that's the real domain.

**Verified**
- `/api/preview` with a wrong secret → 401; with the right secret but not logged in → 403.
- Logged-in admin (temp user, deleted afterwards), headless Chromium: Site settings → typing in "Work intro"
  updated the preview pane within seconds without saving; Projects → typing a new title updated the project list in
  the preview. No page errors. Public site kept the published text throughout.
- Production build: `/` still static. An autosaved draft did not reach the public page or the public API;
  publishing did (page updated in seconds); original text restored.
- Test drafts were overwritten by republishing the original values. Their autosave versions remain in each
  document's Versions history (harmless).
- build ✓, lint ✓, types ✓.

### 2026-10-15 — Phase 5 (emails) ✅ code done · ⏳ final check needs RESEND_API_KEY
**Done**
- `@payloadcms/email-resend` 3.90.2 in `payload.config.ts`, only when `RESEND_API_KEY` is set. Without a key,
  Payload prints emails to the server console instead (useful in dev).
- `src/hooks/messageEmails.ts` (Messages `afterChange`, create only):
  - alert to Email settings → "Send new-message alerts to": subject "New message from {name} ({type})",
    reply-to = the visitor, text + HTML (escaped) with a link to the message in the admin;
  - auto-reply to the visitor if enabled in Email settings, `{name}` replaced, reply-to = Mahnoor.
  - Runs in Next's `after()` so the form answers first; outside Next (scripts) it runs in the background.
    Each email is sent independently (`Promise.allSettled`); failures are logged, never thrown.
- New optional env vars `EMAIL_FROM_ADDRESS` (default `onboarding@resend.dev`) and `EMAIL_FROM_NAME`
  (default "Mahnoor Portfolio"), documented in `.env.example`.

**Decisions**
- Auto-reply stays **off** by default: with `onboarding@resend.dev` Resend can only email the account owner, so
  replies to visitors would fail until a domain is verified.
- `req.context.skipEmails` lets scripts create messages without sending email.
- I did not edit `.env` (the permission check blocked it, which is right); the sender defaults live in code.

**Verified** (production build, real form submit in headless Chromium, auto-reply switched on temporarily)
- No key: form answered with success; server log shows both emails (alert to mahnoorrr41@gmail.com, auto-reply to
  the visitor). Message saved.
- Invalid key: Resend API answered `401 API key is invalid` for both emails; errors were logged, form still showed
  success, message saved.
- build ✓, lint ✓, types ✓. Auto-reply switched back off and test messages deleted.

### 2026-10-15 — Phase 4 (contact form + inbox) ✅
**Done**
- `src/components/ContactForm.tsx` (client): same markup/classes as legacy, calls the `sendMessage` Server Action
  (`src/app/(frontend)/actions/sendMessage.ts`). The old mailto handler was removed from `initEffects.ts`.
- `src/lib/contactSchema.ts` (zod): name 1–120 chars without `<`/`>`, valid email, message 1–5000 chars. Used for
  instant feedback in the browser and enforced again on the server.
- Honeypot field `company` (off-screen, `aria-hidden`, not tabbable): if filled, the visitor sees success and
  nothing is stored.
- Rate limit: max 5 messages per IP per hour, using a SHA-256 hash of the IP salted with `PAYLOAD_SECRET`
  (the raw IP is never stored). Message created with `overrideAccess: true`.
- Project type is only saved if it matches a visible contact option.
- New Site settings texts (Contact tab): rate-limit message and "sending failed" message.
- Inbox list: newest first, columns Status / Created At / Name / Project type.
- `tests/int/contactSchema.int.spec.ts`: validation unit tests.

**Decisions**
- Contact texts now use my default wording (seed updated; the local DB was updated only where the old mailto texts
  were still unedited).
- While sending, the button gets `aria-disabled` instead of `disabled`, so the browser's disabled styling never
  changes the legacy look; double submits are blocked in code.
- Error styling is the legacy one: `.field.err` on bad fields, `form-note bad` / `form-note good`.

**Verified** (production build, headless Chromium)
- Empty form → all three fields red + error note, nothing saved. Bad email → only email red. Name with `<` → rejected.
- Honeypot filled → success shown, nothing saved. Valid message → success, form reset, saved with project type,
  page URL, 64-char IP hash, status `new`. 6th message within the hour → rate-limit message (exactly 5 rows).
- Logged-in admin: list shows newest first with the right columns; a message's name/email/type/message are
  read-only, status and notes editable. POST /api/messages stays 403 (Phase 1).
- Unit tests 4/4 ✓, build ✓ (`/` still static), lint ✓, types ✓. Computed styles still match legacy (only the
  hidden honeypot and the shorter one-line note differ).
- Test messages and the temporary admin were deleted afterwards.

### 2026-10-15 — Phase 3 (frontend port) ✅
**Done**
- `src/app/(frontend)/layout.tsx`: next/font (Syne, Instrument Sans, Unbounded, Space Grotesk), legacy CSS,
  vibe init script before paint (saved `mahnoor-vibe` wins, else the default vibe from Site settings).
- `src/app/(frontend)/style.css`: copy of `legacy/css/style.css` with four changes (listed in its header comment):
  logo urls → `/assets/logo` (copied to `public/`), fonts via next/font variables, `.art-1..4` removed,
  and `-webkit-backdrop-filter` moved before `backdrop-filter` (see Decisions).
- Server components in `src/components/` (Header, MobileMenu, Loader, Hero, Marquee, About, Work, Toolkit,
  Process, Experience, Contact, Footer, Ambient layers): same markup, class names and ids as legacy; all content
  from the Local API (`src/lib/content.ts`). Empty sections/links/badges hide themselves.
- `src/components/Effects.tsx` + `effects/initEffects.ts`: port of `legacy/js/main.js` with npm libraries
  pinned to the legacy versions (gsap 3.12.5, three 0.149.0, matter-js 0.19.0, lenis 1.1.13). Every listener,
  frame, timer, observer, gsap animation/pin, Lenis instance and WebGL context is cleaned up on unmount.
- Revalidation hooks (`src/hooks/revalidate.ts`) on Projects, Skills, ProcessSteps, Experience, ContactOptions,
  Media, Posts and Site settings. SEO title/description/OpenGraph from Site settings.

**Decisions**
- three.js is pinned to r149 on purpose: r152+ changes colour management, which would shift the orb's colours.
- Manifesto words and skill-sphere words are rendered as spans on the server (legacy created them in JS), so React
  never has its DOM replaced. Resulting DOM is identical.
- Project images: `.art-N` classes replaced by an inline background built from each project's image + crop
  position; the hover preview uses the same value.
- Next's CSS minifier keeps only the last of `backdrop-filter` / `-webkit-backdrop-filter`; legacy wrote the
  standard one first, so the header pills lost their blur. Swapping the order fixes it with identical rendering.
- Heading rule: a one-line lead puts the accent on its own line ("Selected" / "work"); a multi-line lead keeps its
  breaks and the accent follows ("From idea\nto" + "launch"). Explained in the admin field description.
- Added labels for cursor words (Open/Drag/Throw) and "Step {n} of {total}". Accessibility strings
  (aria-labels like "Open menu", "Scroll to explore") stay in code.
- Loader + hero entrance play once per page load, not again if effects re-run (e.g. Live Preview later).
- The contact form still uses the legacy mailto behaviour until Phase 4.
- Footer `{year}` is filled at build/revalidation time.

**Verified**
- build ✓ (`/` is static ○), lint ✓ (0 errors), types ✓.
- DOM comparison with legacy (tags, ids, classes, key attributes, text): identical except the expected items above.
- Computed styles of all 667 elements identical, except logo mask URL host, an equivalent `circle()` value, and
  ~0.03px text widths from self-hosted fonts.
- Headless Chromium 1440×900 and iPhone 13, legacy (`npx serve legacy`) vs Next: same page height, same hero name
  size, same scroll positions, loader → orb lands in the logo, gravity, vibe switch (+ toast, localStorage), menu,
  no console errors. Screenshots compared by eye.
- Production build (`next start`): page served from cache; editing Site settings (temp admin, deleted afterwards)
  showed on the page within seconds; restoring brought the original back.

### 2026-10-15 — Phase 2 (seed) ✅
**Done**
- `src/seed.ts` (`npx payload run src/seed.ts`): uploads the avatar + 4 project images from `legacy/assets`,
  creates 4 projects (published, same order and links), 26 skills (10 fe / 8 be / 8 tl), 5 process steps,
  2 experience entries, 5 contact options, and fills every Site settings field with the legacy texts.

**Decisions**
- Re-run safety: documents are matched by title/name/label/filename and skipped if they exist; Site settings
  are only filled while `metaTitle` is empty, so admin edits are never overwritten.
- The about text is rich text, with "Mahnoor Siddiqui" in bold as on the legacy site.
- Footer text uses `{year}` ("© {year} Mahnoor Siddiqui…"), so it stays current; it renders as 2026 today.
- `formNote` / `successMessage` are copied exactly from legacy, but they describe the old mailto form
  ("Sending opens your email app…"). Phase 4 replaces the mailto with a real Server Action, so these two texts
  need new wording then (done in Phase 4).
- No CV PDF exists in the repo, so `cv` is left empty (the button stays hidden until one is uploaded).

**Verified**
- First run created everything; second run created nothing (all skipped).
- API counts: projects 4, skills 26, process-steps 5, experience 2, contact-options 5, media 5. Image files
  return 200 `image/png`; Voltra keeps `center top` crop; Rado Builders has no buttons (as on legacy).
- build ✓, lint ✓ (0 errors).

### 2026-10-15 — Phase 1 (content model) ✅
**Done**
- Globals: `site-settings` (tabs: General & SEO, Hero, About, Sections, Contact, Links, CV, Labels) and
  `email-settings` (admin-only).
- Collections: Projects (drafts, orderable), Skills, ProcessSteps, Experience, ContactOptions (all orderable),
  Messages, Posts (drafts + autosave, Lexical with code blocks + uploads, auto slug), Media (images + PDF), Users.
- Vercel Blob plugin, enabled only when `BLOB_READ_WRITE_TOKEN` is set.
- Access helpers in `src/access`. Types generated.

**Decisions**
- Every visible text is editable, including small interface labels (menu, gravity button, loader, ring texts),
  in a `Labels` tab whose defaults match the legacy site.
- Two-part headings (`lead` + `accent`, e.g. "Selected" + "work"); a newline in `lead` becomes `<br>`.
- Tags are `text` fields with `hasMany` (no separate tags collection).
- Messages: `create` is blocked for everyone (incl. admins); form fields have field-level create/update
  locked, so only `status` and `notes` can change. Default sort newest first.
- ContactOptions: the public only sees `visible` ones.
- Legacy has two LinkedIn URLs (menu: `/in/mahnoorsiddiqui-tech`, contact card: `/in/mahnoor-siddiqui-tech/`);
  using the one from CLAUDE.md (the second).
- `orderable: true` is marked experimental in Payload 3.90 but is what the plan asks for.

**Verified**
- build ✓, lint ✓ (0 errors). REST as anonymous: content 200; messages/users/email-settings 403; POST /api/messages 403.
- Local API checks: drafts and hidden contact options are hidden from the public; admin can change message
  status/notes but not name/email/message; admins can't create messages; slug "Héllo Wörld: test!" → `hello-world-test`.
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
- Phase 7: "Download CV" button (hero, mobile menu, contact card), hidden until a CV PDF is uploaded.
- When the Resend key arrives: send a real test message and confirm the alert (finishes Phase 5).
