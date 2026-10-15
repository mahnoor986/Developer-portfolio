import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

/**
 * Pages are static; these hooks rebuild them in the background after an edit in the admin,
 * so visitors never wait on the database.
 */
function revalidate(req: PayloadRequest, paths: string[]) {
  if (req.context?.disableRevalidate) return
  for (const path of paths) {
    try {
      // 'layout' also refreshes everything below it (the layout reads Site settings).
      revalidatePath(path, 'layout')
      req.payload.logger.info(`Revalidated ${path}`)
    } catch {
      // Outside a Next.js request (e.g. `payload run src/seed.ts`) there is nothing to revalidate.
    }
  }
}

type WithStatus = { _status?: 'draft' | 'published' | null } | undefined | null

/**
 * Autosaved drafts don't change the public site, so they don't rebuild it. A change matters when the
 * document is published now or was published before (unpublishing must remove it from the site).
 * Documents without drafts have no status and always count.
 */
const affectsSite = (doc: WithStatus, previousDoc?: WithStatus) =>
  !doc?._status || doc._status === 'published' || previousDoc?._status === 'published'

export const revalidateHome: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (affectsSite(doc, previousDoc)) revalidate(req, ['/'])
  return doc
}

export const revalidateHomeAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req, ['/'])
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (affectsSite(doc, previousDoc)) revalidate(req, ['/'])
  return doc
}

/** Posts show on /blog, on their own page, and (latest posts) on the home page. */
export const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (!affectsSite(doc, previousDoc)) return doc
  const paths = ['/', '/blog', `/blog/${doc.slug}`]
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) paths.push(`/blog/${previousDoc.slug}`)
  revalidate(req, paths)
  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req, ['/', '/blog', `/blog/${doc.slug}`])
  return doc
}

/** Spread into a collection config: `hooks: { ...homeHooks }`. */
export const homeHooks = {
  afterChange: [revalidateHome],
  afterDelete: [revalidateHomeAfterDelete],
}
