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

### 2026-10-19 — Phase 9 follow-up: Users Undo delete REST 403 — root cause found, not a bug
**Done**
- Reproduced the reported 403 with a header matrix against a disposable logged-in session:
  cookie alone → `user: null` → 403; cookie + `Origin: http://localhost:3000` → 200;
  cookie + `Sec-Fetch-Site: same-origin` → 200; cookie + wrong Origin → 403 (correct CSRF);
  `Authorization: JWT …` → 200; anonymous → 403.
- Root cause: Payload 3.90's `extractJWT` discards the `payload-token` cookie unless the request
  carries an allowlisted `Origin` (or acceptable `Sec-Fetch-Site`). Playwright's `page.request.*`
  sends neither, so the earlier "reproduction" was a test-harness artifact — the app is not broken.
- Proved the real browser flow end to end with a headless Chromium run at localhost:3000:
  Remove → row hides → Undo restores the row, DB intact, no DELETE ever sent; Remove →
  5s commit → DB row deleted, session kept.
- Added `tests/e2e/users-undo-delete.e2e.spec.ts`: signed-in account has no Remove button;
  Undo restores the row and the account survives the toast window; commit deletes the account.
- Fixed the stale `span[title="Dashboard"]` assertion in `tests/helpers/login.ts` and
  `tests/e2e/admin.e2e.spec.ts` (Payload nav markup changed; the span is now hidden). Both
  suites were failing on it before this session.

**Verified**
- `npm run test:int` ✓ (5/5, 2 files) · `npm run test:e2e` ✓ (users-undo-delete 3/3, admin 3/3) ·
  `npm run build` ✓ · `npm run lint` ✓ (0 errors; only pre-existing unused-var warnings in E2E specs).
- Only real accounts remain in the database; all disposable users and temp scripts were removed.
- The pre-existing untracked `tmp-p9user.ts` was left untouched.

### 2026-10-19 — Phase 9 (16/16): Toasts — complete
**Done**
- Styled Payload toasts as responsive orchid-vibe pills at the existing bottom-center position.
- Added five-second Undo to custom delete actions across the admin. The server delete is deferred during the undo window; the row returns immediately when Undo is clicked.

**Verified**
- Production browser checks confirmed the toast appearance and Undo behavior in violet, aqua and blush at 1440px and 390px; no horizontal overflow or page errors. Undo left the underlying record intact.
- Final production build passed. Final lint passed with three existing unused-variable warnings in E2E specs.
- ~~A disposable account's delayed REST delete returned HTTP 403; the UI restored its row and displayed an error. Local API access checks allowed the same authenticated test account, so this REST authorization mismatch remains to investigate before relying on deletion commits.~~ Resolved 2026-10-19 in the follow-up entry above: the 403 was a Playwright `page.request` artifact (no Origin/Sec-Fetch-Site headers), not an app bug; real-browser deletes commit correctly.
- All disposable test accounts and temporary artifacts were removed. The pre-existing untracked `tmp-p9user.ts` was left untouched.

**Next**
- Phase 9 complete. Phase 10 was not started.

### 2026-10-19 — Phase 9 (15/16): Users — complete
**Done**
- Replaced the default user list with responsive rows showing initials, email, an Admin role chip and Active/Locked status chip, with native Edit and Add user links.
- Added a confirmation before removing another account and hid Remove for the signed-in account. The page states that this project currently grants admin access to every user because no role field or RBAC exists.

**Verified**
- Authenticated browser checks showed all three current accounts and confirmed Add/Edit navigation, signed-in user protection, and responsive layout in violet, aqua and blush at 1440px and 390px.
- Production build and lint passed; lint reports only three existing unused-variable warnings in the E2E specs. No browser page errors.
- The disposable test account and browser script were removed.

**Next**
- Toasts (Phase 9 item 16/16).

### 2026-10-19 — Phase 9 (14/16): Email settings — complete
**Done**
- Added a live automatic-reply preview that updates with the subject, body and alert address, plus clear messaging when auto-reply is disabled.
- Added an authenticated test-email action that sends to the saved alert address when Resend is configured and reports a clear setup message when the API key is missing.

**Verified**
- Authenticated browser checks confirmed the preview updates while typing and the test-email action returns the expected missing-Resend-key message.
- Email settings checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow or application page errors.
- Production build passed and includes `/api/email-settings/test`; lint passed with only three existing unused-variable warnings in E2E specs.
- Temporary admin account and browser scripts were removed. Sending a real email remains pending the Resend API key already listed under Waiting for Mahnoor.

**Next**
- Users (Phase 9 item 15/16).

### 2026-10-19 — Phase 9 (13/16): Media — complete
**Done**
- Added a media grid with All/Images/PDFs filters, search, multi-file image/PDF upload, file details and deletion controls.
- Marked referenced files as in use and blocked deletion at the collection hook, covering project images, post covers, and draft/published Site settings photo and CV references.

**Verified**
- Authenticated browser checks covered upload, search, type filters, deletion of unused uploads, and the API rejection for an image still referenced by a project.
- Media view checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow or page errors.
- Production build and lint passed; lint reports only the three existing unused-variable warnings in E2E specs.
- Uploaded test media and the disposable test admin were deleted; no test uploads or accounts remain.

**Next**
- Email settings (Phase 9 item 14/16).

### 2026-10-19 — Phase 9 (6/16): Site settings — complete
**Done**
- Added a save-state indicator beside Payload's document controls, reflecting edits and background saves.
- Added a live Contact heading preview and an uploaded CV card backed by the media relationship, with Replace and
  Remove actions. The empty state links users to Payload's native PDF upload field.

**Verified**
- Authenticated Site settings UI: uploaded and empty CV states rendered; Remove returned the card to the empty state.
- Uploaded and empty CV states checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- Development admin page loaded without page errors. Production build passed; lint passed with three existing
  unused-variable warnings in the E2E specs.
- Temporary PDF, test admin, and the two test-created draft versions were removed. Published and draft CV values
  remain null.

**Next**
- Media (Phase 9 item 13/16).

### 2026-10-19 — Phase 9 (12/16): Blog posts — complete
**Done**
- Replaced the standard list with post cards showing cover, excerpt, publication status and date.
- Added All/Published/Drafts filters, Edit/Delete controls, and the “No posts yet” empty state with a first-post action.
- Kept Payload's post editor and its existing Live Preview route/control.

**Verified**
- Production build and lint passed; lint reports only the three existing unused-variable warnings in E2E specs.
- Authenticated browser checks verified the empty state, editor Live Preview, a temporary draft card, status filters,
  and deletion back to the empty state. Temporary post and admin were deleted.
- Blog posts checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- No application exceptions.

**Next**
- Media (Phase 9 item 13/16).

### 2026-10-19 — Phase 9 (11/16): Contact options — complete
**Done**
- Added the public-form preview of visible contact choices and rows with visibility switches, inline rename, add,
  delete confirmation and up/down ordering.

**Verified**
- Production build and lint passed; lint reports only the three existing unused-variable warnings in E2E specs.
- Authenticated browser checks added, renamed, hid/shown, reordered/restored and deleted a temporary option.
  The preview reflected visible state immediately; five original options remain.
- Contact options checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- No application exceptions. Browser sandbox blocked the existing Gravatar avatar requests.

**Next**
- Blog posts (Phase 9 item 12/16).

### 2026-10-19 — Phase 9 (10/16): Experience — complete
**Done**
- Replaced the standard list with experience timeline rows showing period, role, organization and description.
- Added inline editing, add, delete confirmation and up/down ordering controls.

**Verified**
- Production build and lint passed; lint reports only the three existing unused-variable warnings in E2E specs.
- Authenticated browser checks added, edited, reordered/restored and deleted a temporary entry; the two original
  entries remain.
- Experience checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- No application exceptions. Browser sandbox blocked the existing Gravatar avatar requests.

**Next**
- Contact options (Phase 9 item 11/16).

### 2026-10-19 — Phase 9 (9/16): Process steps — complete
**Done**
- Replaced the standard list with ordered process rows, numbered cards, tag chips and inline editing for title,
  description and tags.
- Added create, delete confirmation and up/down order controls.

**Verified**
- Production build passed; lint passed with the three existing unused-variable warnings in E2E specs.
- Authenticated browser checks added, edited, reordered/restored and deleted a temporary step; five original steps
  remain.
- Process steps checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- No application exceptions. Browser sandbox blocked the existing Gravatar avatar requests.

**Next**
- Experience (Phase 9 item 10/16).

### 2026-10-19 — Phase 9 (8/16): Skills — complete
**Done**
- Replaced the standard Skills list with category cards and inline editing for name, short line and category.
- Added category counts/filters, search, add, delete confirmation, and up/down ordering controls.

**Verified**
- Production build passed; lint passed with the three existing unused-variable warnings in E2E specs.
- Authenticated browser checks added, edited, searched, filtered, reordered/restored and deleted a temporary skill.
  The temporary admin was removed after verification.
- Skills list checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- No application exceptions. Browser sandbox blocked the existing Gravatar avatar requests.

**Next**
- Process steps (Phase 9 item 9/16).

### 2026-10-19 — Phase 9 (7/16): Projects — complete
**Done**
- Replaced Payload's standard Projects list with authenticated project cards showing thumbnails, category/year,
  publication status and accessible ordering controls.
- Added All/Published/Drafts filters, search, publish/unpublish, edit, delete confirmation and Add project links.
- Kept Payload's standard project editor and configured Live Preview available from Edit.

**Verified**
- Production build passed; lint passed with the three existing unused-variable warnings in E2E specs.
- Authenticated browser checks exercised filters/search, publish and unpublish, reorder and order restoration, delete,
  Add and Edit routes. The temporary test project and admin account were deleted afterwards.
- Projects list and editor checked in violet, aqua and blush at 1440px and 390px; no horizontal overflow.
- Development UI had no application exceptions. Browser sandbox blocked the existing Gravatar avatar request.

**Next**
- Skills (Phase 9 item 8/16).

### 2026-10-17 — Phase 9 (5/16): Inbox
**Done**
- Replaced the Messages list with a two-pane inbox. Added counts and filters for All/New/Read/Replied/Spam/Archived,
  search, message details, status controls, Reply by email, delete confirmation and private notes autosave.
- Opening a new message marks it Read. Reply by email marks it Replied. Name, email and message remain read-only;
  mutations use the authenticated REST API and preserve the collection's access rules and hooks.
- Dashboard and global-search message links use `?open=id` to select and show the target in the Inbox.

**Verified**
- Temporary local records exercised auto-read, status counts/filters, search and empty state, reply status,
  notes persistence after reload, deep-link selection, and deletion; temporary user and records removed.
- Desktop (1440px) and 390px checked in Ultraviolet, Aqua and Blush; no horizontal overflow or app console errors.
- `npm run lint` passes with the three pre-existing test warnings; `npm run build` passes.

**Next**
- Phase 9 Site settings.

### 2026-10-17 — Phase 9 (4/16): Dashboard
**Done**
- Replaced Payload's default dashboard with the Night Studio greeting, availability control, four live stat cards,
  latest messages, quick actions and site-at-a-glance card.
- Availability saves to the Site settings global. Dashboard data comes through the authenticated Local API.
- The Upload CV shortcut opens Site settings with the CV tab selected.

**Verified**
- Local Payload data rendered correctly (4 projects, 26 skills, 5 visible contact options); a temporary new
  message populated the count and latest-message row, then was deleted.
- Availability toggled off and back on through the REST API. Add project and Upload CV shortcuts opened their
  intended views; temporary admin removed after testing.
- Desktop (1440px) and 390px views checked in Ultraviolet, Aqua and Blush; no horizontal overflow or app console
  errors. The blocked Gravatar request from the admin account avatar was excluded as an external resource.
- `npm run lint` passes (three existing test warnings); `npm run build` passes.

**Next**
- Phase 9 Inbox.

### 2026-10-17 — Phase 9 (3/16): top bar
**Done**
- Added sticky Payload top bar with REST API search across messages, projects, posts, skills and media;
  results link to matching admin records or lists.
- Added Ultraviolet/Aqua/Blush switcher, persisted as `mahnoor-admin-vibe`, and a View site link.
- Removed the inline script from the custom Payload header after browser inspection showed a React warning;
  the admin provider now applies the saved vibe during layout setup.

**Verified**
- `npm run lint` passes (three existing warnings in E2E test files); `npm run build` passes.
- Authenticated admin checked at 1440px and 390px in all three vibes; no horizontal overflow, top bar and
  search visible in every case. Search for `React` returned a matching skill; Aqua persisted after reload.
- No app runtime errors. The browser sandbox blocked the Payload avatar's Gravatar request; this is external
  to the top bar. Temporary admin removed after verification.

**Next**
- Phase 9 Dashboard.
- Commit `4f49fd6` was pushed to `origin/payload-migration`.

### 2026-10-15 — Phase 8 (blog) ✅
**Done**
- `/blog` (static): kicker, two-part heading, intro and a grid of post cards (cover, date, title, excerpt, tags,
  "Read post"); "No posts yet" text if visited with no posts.
- `/blog/[slug]` (static, `generateStaticParams` + `generateMetadata` with OpenGraph article data): back link,
  date, title, excerpt, tags, cover, and the Lexical body (`src/components/blog/PostBody.tsx`) with styled
  headings, lists, quotes, inline code, images and code blocks (language label + `<pre>`). Unknown slugs → 404.
- Home: "Latest posts" strip (3 newest) after "Selected work", and a "Blog" link in the menu. Both hidden while
  no post is published.
- `SiteShell` component: background layers, header, menu, footer and Effects shared by the home page and blog
  pages. On blog pages the logo/menu/CTA link back to home sections (`/#work`); no loader.
- `initEffects` now skips home-only parts (loader, hero name, gravity, sphere…) when they aren't on the page;
  Effects re-runs when the route changes, so animations re-attach after client-side navigation.
- Site settings → Sections → Blog: kicker, heading, intro, "All posts" / "Read post" / "Back" labels, empty text.
- Blog styles appended to the "additions" block of `style.css`, built only from the legacy colour tokens and
  fonts, so all three vibes work.

**Decisions**
- No syntax highlighting library (keeps the bundle small); code blocks get the site's monospace styling and a
  language label. Easy to add Shiki later if wanted.
- The strip sits after "Selected work", not near Experience, so it doesn't interfere with the
  Experience → Contact pin/curl animation.
- Internal blog links use `next/link`; links from blog pages back to home sections are full page loads (the
  loader plays, like opening the site fresh).

**Verified** (production build)
- No posts: home page identical to before (computed-style diff unchanged), no menu link, `/blog` shows empty text,
  `/blog/unknown` → 404.
- Published a rich test post (bold, inline code, h2/h3, list, C code block, image, quote, cover) through the API:
  it appeared in the home strip, the menu, `/blog` and its own page, all rendered correctly; screenshots checked
  in violet and blush.
- Browser: home → /blog → post (client-side) → menu "Work" → back on home at the Work section. Always exactly one
  WebGL canvas, cursor/orb/vibe working, no console errors.
- Unpublish → gone from home, menu, /blog and the public API; post page 404. Republish → back. Delete → gone.
- Test post, its versions and the temp admin deleted. build ✓, lint ✓, types ✓.

### 2026-10-15 — Phase 7 (CV download) ✅
**Done**
- `src/components/Cv.tsx`: `getCv()` returns the uploaded PDF (or null → every CV button hides) and `CvButton`.
- Buttons in three places, reusing legacy styles: hero (under the intro, `pill ghost small` + download icon),
  menu (a "CV" block like "Say Hi"/"Socials"), contact sidebar (a `card` with the same pill).
- New Site settings field `cvTitle` ("CV", the heading in the menu and contact card) next to the button label.
- Only addition to the copied CSS: `.hero-cv{margin-top:22px}`, in a marked "additions" block at the end.

**Decisions**
- Link gets `?v=<media updatedAt>` so replacing the file always serves the new one (no stale browser cache), plus
  `download="Mahnoor-Siddiqui-CV.pdf"` and `target="_blank"` (Blob URLs are cross-origin, where browsers open the
  PDF in a new tab instead of downloading).
- New DB columns are created by the dev server (schema push) in development. Production will use migrations
  (Phase 10). If a build fails with "Failed query", open the dev server once so it can add the new columns.

**Verified** (production build; temp admin, test PDFs and media deleted afterwards)
- No CV → no CV button anywhere; page unchanged.
- Uploaded a test PDF and selected it in Site settings → 3 links (hero, menu, contact card) → download returns
  200 `application/pdf` with the right content. Screenshots: hero and menu look like native parts of the design.
- Replaced the file on the same media item → page link changed automatically → download returns the new PDF.
- build ✓, lint ✓, types ✓.

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
- Phase 9: Projects.
- When the Resend key arrives: send a real test message and confirm the alert (finishes Phase 5).
