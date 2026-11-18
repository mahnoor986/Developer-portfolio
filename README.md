# Mahnoor — Developer Portfolio

My personal portfolio, built with **Next.js** and **Payload CMS**. All content,
contact messages and emails are managed from the Payload admin panel, so updating
the site never needs a code change.

> **Status:** moving from the original static HTML site to Next.js + Payload.
> Progress is tracked in [`PLAN.md`](PLAN.md) and [`PROGRESS.md`](PROGRESS.md).
> The original site is kept in [`legacy/`](legacy/) for reference.

## Tech stack
| Part | Tool |
|---|---|
| Frontend | Next.js (App Router), TypeScript |
| CMS / backend | Payload 3 (admin panel at `/admin`) |
| Database | PostgreSQL (local Docker) |
| File storage | Vercel Blob (images, CV) |
| Email | EmailJS (server-side REST API) |
| Animations | GSAP + ScrollTrigger, Three.js, Matter.js, Lenis |
| Hosting | Vercel |

## What I can manage from the admin
- **Site settings:** hero, about, photo, facts, section texts, contact texts, links, footer, SEO, default colour vibe
- **Projects, skills, process steps, experience:** add, edit, hide, drag to reorder
- **Contact form:** the "What do you need?" options and all its texts
- **Messages inbox:** every message from the contact form, with status (New / Read / Replied / Spam / Archived) and private notes
- **Emails:** where new-message alerts go, and the automatic thank-you reply to clients
- **CV:** upload a PDF and the "Download CV" button updates itself
- **Blog:** write, draft and publish posts
- **Live Preview:** see changes on the site while editing

## Run it locally
Requirements: Node.js 20+, and a PostgreSQL database (local Postgres in Docker).

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev
```
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (create your admin user on first visit)

Fill the admin with the starting content:
```bash
npx payload run src/seed.ts
```

## Environment variables
See `.env.example` for the full list:

| Variable | What it is |
|---|---|
| `DATABASE_URI` | Postgres connection string (local Docker) |
| `PAYLOAD_SECRET` | Long random string (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SERVER_URL` | Site URL, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS owner-notification template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public account key; public, not a secret |
| `NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID` | EmailJS visitor auto-reply template ID |
| `EMAILJS_PRIVATE_KEY` | EmailJS private account key; server-side only |
| `EMAILJS_FROM_ADDRESS` | Verified sender address configured in the EmailJS service |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob (production uploads) |
| `PREVIEW_SECRET` | Random string for Live Preview |

### EmailJS setup

Create a real EmailJS email service and two templates in the EmailJS dashboard; the application does not create
these resources. Use the configured service and template IDs in `.env` locally and in Vercel's environment settings.

**Owner notification template**
- **From Email:** `{{from_email}}` (configure this same verified sender as `EMAILJS_FROM_ADDRESS`)
- **To Email:** `{{to_email}}` (the server fills this from Payload's private Email settings; never from a visitor field)
- **Subject:** `{{subject}}`
- **Reply-To:** `{{reply_to}}`
- Include these template variables in the body: `{{name}}`, `{{email}}`, `{{project_type}}`, `{{message}}`,
  `{{page_url}}`, and `{{admin_url}}`. In HTML templates, use the corresponding `_html` variables (for example
  `{{message_html}}`) for user-provided values; these are HTML-escaped, with message newlines converted to `<br>`.

**Visitor auto-reply template**
- **From Email:** `{{from_email}}`
- **To Email:** `{{to_email}}` (the server fills this from the validated, stored visitor email)
- **Subject:** `{{subject}}`
- **Reply-To:** `{{reply_to}}`
- Set the body to `{{message}}` (or `{{message_html}}` in an HTML template). This contains the complete professional
  reply configured in Payload → Email settings; `{name}` there is replaced with the validated sender name. This
  template also carries Payload-generated authentication emails such as password resets.
- Keep automatic replies disabled in Payload until this template and its environment variables are configured.

For both templates, enable EmailJS private-key authorization for server-side REST API requests (so public-key-only
requests cannot send to arbitrary recipients). Restrict allowed origins in EmailJS security settings to the local
development origin and the production portfolio domain.
The public key and `NEXT_PUBLIC_` IDs are visible to visitors and are not credentials. The private key must remain
server-side as `EMAILJS_PRIVATE_KEY`. EmailJS documents a one-request-per-second limit; sends are performed
sequentially when both templates are enabled. This reduces collisions but is not a global exactly-once guarantee.
The existing contact action validates submissions and rate-limits by IP, stores the message first, and only reports
full success when configured email sends are accepted. If delivery fails, the message remains in the admin inbox
and the form reports the delivery failure.

## Project structure
```
src/app/(frontend)/    public site, blog and the contact form action
src/app/(payload)/     Payload admin + API, admin styling (custom.scss)
src/collections/       Projects, Skills, ProcessSteps, Experience, ContactOptions, Messages, Posts, Media, Users
src/globals/           SiteSettings, EmailSettings
src/components/        page sections and Effects.tsx (all animations)
src/seed.ts            starting content
legacy/                the original static site (reference only)
```

## Deploying (Vercel)

`vercel.json` sets the build command to `npm run ci`, which runs `npm run payload migrate && npm run build`. Locally,
`npm run build` still builds without touching the database.

**Checklist**
- [ ] **Database:** the Docker Postgres is local-only. A Vercel deployment needs a database it can reach; decide this before deploying.
- [ ] **Blob:** Vercel → Storage → create a Blob store; connect it to the project so `BLOB_READ_WRITE_TOKEN` is set.
- [ ] **Import the repo** in Vercel (branch `master` once `payload-migration` is merged).
- [ ] **Environment variables** (Production, and Preview if wanted): `DATABASE_URI`, `PAYLOAD_SECRET`,
      `NEXT_PUBLIC_SERVER_URL` (the real domain, no trailing slash), `PREVIEW_SECRET`, `BLOB_READ_WRITE_TOKEN`,
      and the six EmailJS variables from the table above (`EMAILJS_PRIVATE_KEY` is server-side only).
- [ ] **EmailJS:** service + both templates created, private-key authorization on, allowed origins restricted to
      `http://localhost:3000` and the production domain (see "EmailJS setup").
- [ ] **First deploy:** the build applies migrations in `src/migrations/`. After schema changes, run
      `npm run payload migrate:create` locally and commit the new migration.
- [ ] **Seed production once:** `npx payload run src/seed.ts` with `DATABASE_URI` pointing at the target database (safe to re-run).
- [ ] **Create the admin user** at `/admin`, then upload the CV in Site settings → CV.
- [ ] **Final checks:** Lighthouse, mobile layout, contact form → owner alert (and auto-reply once enabled),
      Live Preview, CV download.
- [ ] Only then enable visitor auto-replies in Admin → Email settings.

## Working with Claude Code
`CLAUDE.md` holds the project rules for Claude Code, and `.claude/settings.json`
pre-approves routine commands. The plan lives in `PLAN.md` and the work log in
`PROGRESS.md`.