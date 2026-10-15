import 'server-only'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Media } from '@/payload-types'

export const getPayloadClient = cache(async () => getPayload({ config }))

/** True inside the admin's Live Preview (draft mode is only turned on for logged-in admins). */
export const isDraftMode = cache(async () => (await draftMode()).isEnabled)

/** Normal visitors get published content only; in draft mode the latest drafts are shown. */
const accessFor = (draft: boolean) =>
  // Draft mode is only reachable through /api/preview, which checks the admin login.
  draft ? ({ draft: true, overrideAccess: true } as const) : ({ draft: false, overrideAccess: false } as const)

export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1, ...accessFor(await isDraftMode()) })
})

const postCardSelect = {
  title: true,
  slug: true,
  excerpt: true,
  cover: true,
  tags: true,
  publishedAt: true,
} as const

/** Published posts, newest first (drafts too in draft mode). */
export const getPosts = cache(async (limit = 0) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    depth: 1,
    limit,
    pagination: limit > 0,
    select: postCardSelect,
    ...accessFor(await isDraftMode()),
  })
  return res.docs
})

export const getPost = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    ...accessFor(await isDraftMode()),
  })
  return res.docs[0] ?? null
})

/** Slugs of published posts, for generateStaticParams. */
export const getPublishedSlugs = async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    depth: 0,
    pagination: false,
    select: { slug: true },
    overrideAccess: false,
  })
  return res.docs.map((p) => p.slug).filter(Boolean)
}

/** Everything the home page needs, fetched in parallel through the Local API. */
export const getHomeContent = cache(async () => {
  const payload = await getPayloadClient()
  const draft = await isDraftMode()
  const list = { depth: 1, pagination: false, ...accessFor(draft) } as const

  const [settings, projects, skills, steps, experience, contactOptions, latestPosts] = await Promise.all([
    getSiteSettings(),
    payload.find({ collection: 'projects', sort: '_order', ...list }),
    payload.find({ collection: 'skills', sort: '_order', ...list }),
    payload.find({ collection: 'process-steps', sort: '_order', ...list }),
    payload.find({ collection: 'experience', sort: '_order', ...list }),
    payload.find({ collection: 'contact-options', sort: '_order', where: { visible: { equals: true } }, ...list }),
    getPosts(3),
  ])

  return {
    draft,
    settings,
    projects: projects.docs,
    skills: skills.docs,
    steps: steps.docs,
    experience: experience.docs,
    contactOptions: contactOptions.docs,
    latestPosts,
  }
})

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>
export type Settings = HomeContent['settings']
export type PostCardData = HomeContent['latestPosts'][number]

/** URL of an upload field that may be an id (depth 0) or a populated document. */
export const mediaUrl = (m: number | Media | null | undefined): string | undefined =>
  m && typeof m === 'object' ? (m.url ?? undefined) : undefined

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
