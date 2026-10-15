# PROGRESS

## Waiting for Mahnoor
- Nothing blocking right now. Still needed later (see PLAN.md "Waiting on Mahnoor"):
  Neon `DATABASE_URI`, `RESEND_API_KEY`, a verified domain in Resend, Vercel project + Blob token.
- (Not blocking, needed by Phase 4) New wording for the contact form texts. The old site opened your email app,
  the new form sends directly. My defaults unless you prefer others:
  - Note under the form: "I usually reply within a day or two."
  - Success message: "Thanks! Your message is on its way. I'll get back to you soon."
- (Not blocking) Upload your CV PDF in Admin → Site settings → CV whenever you're ready.

## Log

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
  need new wording then (see Waiting for Mahnoor).
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
- Phase 4: contact form → Server Action + messages inbox.
