import 'server-only'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Media } from '@/payload-types'

export const getPayloadClient = cache(async () => getPayload({ config }))

/** True inside the admin's Live Preview (draft mode is only turned on for logged-in admins). */
export const isDraftMode = cache(async () => (await draftMode()).isEnabled)

/**
 * Everything the home page needs, fetched in parallel through the Local API.
 * Normal visitors get published content only; in draft mode the latest drafts are shown.
 */
export const getHomeContent = cache(async () => {
  const payload = await getPayloadClient()
  const draft = await isDraftMode()
  // Draft mode is only reachable through /api/preview, which checks the admin login.
  const access = draft ? { draft: true, overrideAccess: true } : { draft: false, overrideAccess: false }
  const list = { depth: 1, pagination: false, ...access } as const

  const [settings, projects, skills, steps, experience, contactOptions] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1, ...access }),
    payload.find({ collection: 'projects', sort: '_order', ...list }),
    payload.find({ collection: 'skills', sort: '_order', ...list }),
    payload.find({ collection: 'process-steps', sort: '_order', ...list }),
    payload.find({ collection: 'experience', sort: '_order', ...list }),
    payload.find({ collection: 'contact-options', sort: '_order', where: { visible: { equals: true } }, ...list }),
  ])

  return {
    draft,
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
