import 'server-only'

import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Media } from '@/payload-types'

export const getPayloadClient = cache(async () => getPayload({ config }))

/** Everything the home page needs, fetched in parallel through the Local API. */
export const getHomeContent = cache(async () => {
  const payload = await getPayloadClient()
  const common = { depth: 1, pagination: false, overrideAccess: false } as const

  const [settings, projects, skills, steps, experience, contactOptions] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: false }),
    payload.find({ collection: 'projects', sort: '_order', ...common }),
    payload.find({ collection: 'skills', sort: '_order', ...common }),
    payload.find({ collection: 'process-steps', sort: '_order', ...common }),
    payload.find({ collection: 'experience', sort: '_order', ...common }),
    payload.find({ collection: 'contact-options', sort: '_order', ...common }),
  ])

  return {
    settings,
    projects: projects.docs,
    skills: skills.docs,
    steps: steps.docs,
    experience: experience.docs,
    contactOptions: contactOptions.docs,
  }
})

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>
export type Settings = HomeContent['settings']

/** URL of an upload field that may be an id (depth 0) or a populated document. */
export const mediaUrl = (m: number | Media | null | undefined): string | undefined =>
  m && typeof m === 'object' ? (m.url ?? undefined) : undefined
