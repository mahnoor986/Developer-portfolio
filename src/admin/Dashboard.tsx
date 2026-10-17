import type { ServerProps } from 'payload'

import DashboardClient, { type DashboardData } from './DashboardClient'

const first = <T,>(items: T[]) => items[0]

const relativeTime = (value: string) => {
  const date = new Date(value)
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
}

const isPublished = (doc: { _status?: string | null }) => doc._status === 'published'

/** Real-data replacement for Payload's default dashboard, styled after Night Studio. */
export default async function Dashboard({ payload, user }: ServerProps) {
  if (!user) return null

  const auth = { user, overrideAccess: false as const }
  const [newMessageCount, messages, latestNew, projects, posts, skills, contactOptions, site, email] = await Promise.all([
    payload.count({ collection: 'messages', where: { status: { equals: 'new' } }, ...auth }),
    payload.find({
      collection: 'messages',
      where: { status: { not_in: ['spam', 'archived'] } },
      sort: '-createdAt',
      limit: 5,
      depth: 0,
      ...auth,
    }),
    payload.find({ collection: 'messages', where: { status: { equals: 'new' } }, sort: '-createdAt', limit: 1, depth: 0, ...auth }),
    payload.find({ collection: 'projects', limit: 1000, depth: 0, draft: true, ...auth }),
    payload.find({ collection: 'posts', limit: 1000, depth: 0, draft: true, ...auth }),
    payload.count({ collection: 'skills', ...auth }),
    payload.find({ collection: 'contact-options', where: { visible: { equals: true } }, limit: 1000, depth: 0, ...auth }),
    payload.findGlobal({ slug: 'site-settings', depth: 1, draft: true, ...auth }),
    payload.findGlobal({ slug: 'email-settings', ...auth }),
  ])

  const publishedProjects = projects.docs.filter(isPublished).length
  const draftProjects = projects.docs.length - publishedProjects
  const publishedPosts = posts.docs.filter(isPublished).length
  const draftPosts = posts.docs.length - publishedPosts
  const latestMessage = first(latestNew.docs)
  const fullName = site.fullName || (user as { name?: string | null }).name || user.email
  const name = fullName.trim().split(/\s+/)[0] || 'Mahnoor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const vibeName = ({ violet: 'Ultraviolet', aqua: 'Aqua', blush: 'Blush' } as Record<string, string>)[site.defaultVibe] ?? 'Ultraviolet'
  const cvUploaded = Boolean(site.cv)

  const data: DashboardData = {
    name,
    greeting,
    newMessages: newMessageCount.totalDocs,
    available: Boolean(site.available),
    availabilityText: site.availabilityText || 'Available for new projects',
    defaultVibe: vibeName,
    visibleOptions: contactOptions.totalDocs,
    autoReply: Boolean(email.autoReplyEnabled),
    cvUploaded,
    projects: projects.docs.length,
    publishedProjects,
    draftProjects,
    posts: posts.docs.length,
    publishedPosts,
    draftPosts,
    skills: skills.totalDocs,
    latestSender: latestMessage?.name ?? '',
    latestType: latestMessage?.projectType ?? '',
    latest: messages.docs.map((message) => ({
      id: String(message.id),
      name: message.name,
      when: relativeTime(message.createdAt),
      type: message.projectType || 'General',
      preview: message.message.replace(/\s+/g, ' ').trim(),
      status: message.status,
    })),
  }

  return <DashboardClient data={data} />
}
