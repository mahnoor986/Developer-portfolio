# Admin design spec: "Night Studio"

The Payload admin must look and behave like the approved prototype in
`design/admin-prototype.dc.html`. Treat that file as the **visual source of truth**:
read its `<style>` block for exact CSS (tokens, sizes, radii, states) and its markup
for structure and copy.

It is a one-file prototype with fake sample data, written in a small template format
(`{{holes}}`, `<sc-if>`, `<sc-for>`) that only runs inside the design tool. **Don't run it
and don't copy its JS.** Rebuild each screen as real Payload admin components that read
and write real data. Asset URLs that start with `/_blob/` are prototype uploads; use
`/assets/logo/letter-1..7.png` and the real Media collection instead.

---

## 1. Design tokens

Colour vibes. Same values as the public site; apply them on `html[data-vibe="…"]`:

| Token | violet (default) | aqua | blush |
|---|---|---|---|
| `--void` (page bg) | `#07040C` | `#030A0B` | `#0C0507` |
| `--night` (cards, sidebar) | `#120A1F` | `#08171A` | `#1A0B10` |
| `--haze` (hover, chips) | `#22143A` | `#0F2A2E` | `#2E1520` |
| `--line` (borders) | `#33224F` | `#1C4247` | `#4A2433` |
| `--ink` (text) | `#F1EAFB` | `#E6FBFB` | `#FDEDF0` |
| `--muted` | `#A898C2` | `#8FB9BB` | `#C9A3AC` |
| `--orchid` (accent) | `#B38CFF` | `#78E0E0` | `#F6B0BB` |
| `--violet` | `#7B3CFF` | `#2FB5B8` | `#E2728A` |
| `--soft` (accent hover) | `#D9C8FF` | `#C2F3F3` | `#FBD6DC` |

Fixed colours: success green `#7CE0A8` (dot, glow `0 0 12px #7CE0A8`, border `#2E6B4D`);
danger text `#FF9DAF`, border `#5A2533`, hover bg `#2A1018`.

Type: load these in the admin with `next/font`, already used by the site.
- **Syne** 700/800: page titles (`.h1` clamp(28px,3vw,40px)), card titles (21px), big numbers (48px/800).
- **Unbounded** 700: dashboard greeting only.
- **Instrument Sans** 400–700: body 15px/1.55, buttons 14px/500.
- **Space Grotesk** 600: uppercase labels (11–12.5px, letter-spacing .12em), chips, crumbs.

Shapes: buttons and chips are pills (`border-radius: 999px`, min-height 44px, small 36px).
Cards 22px radius. Inputs 14px radius, min-height 46px, bg `--void`, 1px `--line` border,
orchid focus ring 2px with offset 2px. Rows 16px radius.

Motion: only 200–300ms colour/border transitions. Logo letters shimmer on hover, as on the
site. Everything off under `prefers-reduced-motion`. **No visible scrollbars**
(`scrollbar-width: none` and `::-webkit-scrollbar { display: none }`); scrolling must still work.

## 2. Layout (all screens)
- **Left sidebar** (264px, `--night`, right border) is **sticky**: `position: sticky; top: 0;
  height: 100vh; overflow-y: auto` on screens ≥ 900px. Below 900px it stacks above the content.
  - Top: the real "mahnoor" logo (7 letter PNGs as CSS masks, coloured with the orchid→ink
    gradient, same as `.wm/.lt` in `src/app/(frontend)/style.css`) + an "ADMIN" outline chip.
  - Groups: Dashboard, Inbox (orchid count badge = new messages) ·
    **WEBSITE**: Site settings, Projects (count), Skills (count), Process steps, Experience,
    Contact options · **CONTENT**: Blog posts (count), Media (count) ·
    **SETTINGS**: Email settings, Users.
  - Active item is a solid orchid pill with `--void` text. Group labels are Space Grotesk uppercase.
  - Bottom: user card with avatar, name and role, plus logout.
- **Top bar** is sticky inside the content column: a global **search** pill on the left; the
  **Vibe switcher** (3 dots), a **View site ↗** pill and the account menu on the right.
- Content padding: `28px clamp(18px,3.4vw,48px) 72px`, sections 24px apart.

## 3. Screens (match the prototype one by one)

1. **Dashboard** (replace the default dashboard view)
   - Crumb, then "Good morning/afternoon/evening, **Mahnoor**" in Unbounded (by local time),
     and a subline with the new-message count.
   - **Available toggle pill** (green dot + switch). It writes `site-settings.available`.
   - 4 stat cards: New messages (orchid border when > 0, shows the latest sender · type),
     Projects (published · drafts), Blog posts, Skills. Each links to its section.
   - "Latest messages" card: the 5 newest that aren't spam or archived, with name, time, a type
     chip, a one-line preview and a status chip. Clicking one opens it in the Inbox.
   - "Quick actions": Edit homepage, Add project, New post, Upload CV (opens the CV tab).
   - "Site at a glance": default vibe, visible contact options, auto-reply on/off, CV status.
2. **Inbox** (custom list view for `messages`)
   - Status filter pills with counts (All = not spam/archived, New, Read, Replied, Spam,
     Archived) and an inbox search.
   - Split view: the list on the left (bold name if new, type chip, status chip, 2-line preview,
     orchid border on the selected one) and a reading pane on the right.
   - Opening a new message sets it to Read. The pane has the name, email, a **Reply by email**
     button (mailto, marks it Replied), Delete, info tiles (Needs / Received / From), the full
     message, status pills, and a **Private notes** textarea that autosaves.
   - Name, email and message stay read-only (this matches the existing access rules).
3. **Site settings** (global): tabs shown as pills; "Unsaved changes" / "All changes saved"
   next to the Save button. The Contact tab shows a live heading preview, and the CV tab has
   empty and uploaded states as in the prototype.
4. **Projects**: a custom list view of cards with a thumbnail, title, category · year, status
   chip, ↑/↓ order, Publish/Unpublish, Edit and Delete, plus filter pills and search. The edit
   view keeps Payload's form and Live Preview, styled with the tokens above.
5. **Skills, Process steps, Experience, Contact options**: custom list views that look like the
   prototype rows, with inline edit, add, delete, ↑/↓ order (using the orderable field), a
   category filter and search for skills, and a show/hide switch plus an "on your site" preview
   for options.
6. **Blog posts**: cards list with filter pills; an empty state saying "No posts yet" plus a
   button when there are none. The editor is Payload's own, with Live Preview.
7. **Media**: a grid of cards with filters (All / Images / PDFs), search, an upload button and
   delete. Block deleting a file that is used by a project or post.
8. **Email settings** (global): add a `ui` field component showing the email preview card
   ("What the client receives"), which updates as you type, and a **Send me a test email**
   button.
9. **Users**: list rows with initials avatar, role chip and status chip, styled like the prototype.

Toasts: use Payload's toast in the prototype's style (orchid pill, bottom centre, with **Undo**
for deletes where possible).

## 4. How to build it in Payload 3
- `admin.theme: 'dark'`, `admin.meta` (title suffix "· Mahnoor", favicon).
- `src/app/(payload)/custom.scss`: map the tokens onto Payload's variables (`--theme-bg`,
  `--theme-text`, `--theme-elevation-*`, inputs, success/error), style buttons, pills, tabs,
  tables and forms, hide scrollbars. Put rules in `@layer payload` so they win.
- `admin.components.Nav`: a custom sticky sidebar, with counts from the Local API.
- `admin.components.graphics.Logo` / `Icon`: the mask-based "mahnoor" letters.
- `admin.components.actions` (or `header`): the search box, vibe switcher and View site link.
  - The vibe is saved in localStorage (`mahnoor-admin-vibe`) and set as `data-vibe` on `<html>`.
  - Search queries the REST API across messages, projects, posts, skills and media, then
    links to each item's edit page.
- `admin.components.views.dashboard`: the custom Dashboard.
- Collection list views: `admin.components.views.list.Component` for messages, projects,
  skills, process-steps, experience, contact-options, posts and media. Wrap them in Payload's
  default template so the nav stays. **Check the logged-in user** inside every custom view.
- Field `admin.components.Cell` for status chips and thumbnails wherever default tables remain.
- Use `@payloadcms/ui` hooks and components (`useAuth`, `toast`, `Button`, etc.) where they fit.
  Keep all existing access rules, hooks and Live Preview working.

## 5. Done when
- Side by side with the prototype, every screen matches the layout, colours, type, spacing
  and states, in all three vibes, at desktop and at 390px wide.
- Every button, filter, search, toggle, inline edit, order arrow and delete works on real data.
- `npm run build` and `npm run lint` pass. Login, create/edit/delete in each collection,
  globals, Live Preview, and the contact form → inbox → email flow still work.