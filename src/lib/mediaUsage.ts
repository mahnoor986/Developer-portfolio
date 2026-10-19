import type { Payload } from 'payload'

import type { User } from '../payload-types'

const relationID = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

/** Media relationships that must be kept to avoid breaking public content. */
export async function getMediaUsage(payload: Payload, user?: User) {
  const access = user ? { user, overrideAccess: false as const } : { overrideAccess: true as const }
  const [projects, posts, settingsDraft, settingsPublished] = await Promise.all([
    payload.find({ collection: 'projects', depth: 0, draft: true, limit: 1000, ...access }),
    payload.find({ collection: 'posts', depth: 0, draft: true, limit: 1000, ...access }),
    payload.findGlobal({ slug: 'site-settings', draft: true, ...access }),
    payload.findGlobal({ slug: 'site-settings', draft: false, ...access }),
  ])

  const usage = new Map<string, Set<string>>()
  const add = (value: unknown, label: string) => {
    const id = relationID(value)
    if (!id) return
    const labels = usage.get(id) ?? new Set<string>()
    labels.add(label)
    usage.set(id, labels)
  }
  for (const project of projects.docs) add(project.image, 'Project')
  for (const post of posts.docs) add(post.cover, 'Post')
  for (const settings of [settingsDraft, settingsPublished]) {
    add(settings.photo, 'Site settings')
    add(settings.cv, 'Site settings')
  }

  return new Map([...usage].map(([id, labels]) => [id, [...labels]]))
}
