import type { ServerProps } from 'payload'

import { NavLinks, type NavGroup } from './NavLinks'
import { Wordmark } from './Wordmark'

const A = '/admin'

/** Initials for the avatar circle ("Mahnoor Siddiqui" → "MS"). */
export const initials = (name?: string | null, email?: string | null) => {
  const parts = (name || email?.split('@')[0] || '?').trim().split(/[\s._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/**
 * admin.components.Nav: the sticky "Night Studio" sidebar.
 * Counts come from the Local API as the logged-in user, so they respect access rules.
 */
export default async function Nav({ payload, user }: ServerProps) {
  if (!user || !payload) return null

  const count = async (collection: 'messages' | 'projects' | 'skills' | 'posts' | 'media', where?: object) =>
    (await payload.count({ collection, user, overrideAccess: false, where: where as never })).totalDocs

  const [newMsgs, projects, skills, posts, media] = await Promise.all([
    count('messages', { status: { equals: 'new' } }),
    count('projects'),
    count('skills'),
    count('posts'),
    count('media'),
  ])

  const groups: NavGroup[] = [
    {
      items: [
        { href: A, label: 'Dashboard', icon: 'dashboard', exact: true },
        { href: `${A}/collections/messages`, label: 'Inbox', icon: 'inbox', count: newMsgs, hot: newMsgs > 0 },
      ],
    },
    {
      label: 'Website',
      items: [
        { href: `${A}/globals/site-settings`, label: 'Site settings' },
        { href: `${A}/collections/projects`, label: 'Projects', count: projects },
        { href: `${A}/collections/skills`, label: 'Skills', count: skills },
        { href: `${A}/collections/process-steps`, label: 'Process steps' },
        { href: `${A}/collections/experience`, label: 'Experience' },
        { href: `${A}/collections/contact-options`, label: 'Contact options' },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: `${A}/collections/posts`, label: 'Blog posts', count: posts },
        { href: `${A}/collections/media`, label: 'Media', count: media },
      ],
    },
    {
      label: 'Settings',
      items: [
        { href: `${A}/globals/email-settings`, label: 'Email settings' },
        { href: `${A}/collections/users`, label: 'Users' },
      ],
    },
  ]

  const name = (user as { name?: string | null }).name || user.email

  return (
    <aside className="ms-side">
      <div className="ms-side__top">
        <a className="ms-logo" href={A} aria-label="mahnoor admin, go to dashboard">
          <Wordmark />
        </a>
        <span className="ms-tagadmin">admin</span>
      </div>
      <NavLinks groups={groups} />
      <div className="ms-usercard">
        <span className="ms-avatar" aria-hidden="true">
          {initials((user as { name?: string | null }).name, user.email)}
        </span>
        <a className="ms-usercard__who" href={`${A}/account`}>
          <span className="ms-ell" style={{ fontWeight: 600, fontSize: 14 }}>
            {name}
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Admin</span>
        </a>
        <a className="ms-ib" href={`${A}/logout`} aria-label="Log out" title="Log out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </a>
      </div>
    </aside>
  )
}
