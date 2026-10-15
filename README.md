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
| Database | PostgreSQL on Neon |
| File storage | Vercel Blob (images, CV) |
| Email | Resend |
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
Requirements: Node.js 20+, and a PostgreSQL database (Neon, or local Postgres in Docker).

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
| `DATABASE_URI` | Postgres connection string (Neon) |
| `PAYLOAD_SECRET` | Long random string (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SERVER_URL` | Site URL, e.g. `http://localhost:3000` |
| `RESEND_API_KEY` | From the Resend dashboard |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob (production uploads) |
| `PREVIEW_SECRET` | Random string for Live Preview |

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
1. Import the repo in Vercel.
2. Add Neon (Vercel integration) and create a Blob store.
3. Add the environment variables above.
4. Build command: `payload migrate && next build`.
5. Verify your domain in Resend so client auto-replies can be sent. Without a
   verified domain, Resend can only email your own account address.

## Working with Claude Code
`CLAUDE.md` holds the project rules for Claude Code, and `.claude/settings.json`
pre-approves routine commands. The plan lives in `PLAN.md` and the work log in
`PROGRESS.md`.