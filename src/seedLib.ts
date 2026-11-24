/** Helpers shared by `src/seed.ts` and `src/scripts/applyClientFacing.ts`. */
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

import { images, type ImageKey } from './seedContent'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const log = (msg: string) => console.log(`[seed] ${msg}`)

type Slug = Parameters<Payload['find']>[0]['collection']

/** First document whose `field` equals `value`, drafts included. */
export async function findBy(payload: Payload, collection: Slug, field: string, value: string) {
  const res = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    draft: true,
    pagination: false,
  })
  return res.docs[0] as unknown as ({ id: number } & Record<string, unknown>) | undefined
}

/** Uploads a seed image once (matched by filename) and returns its media id. */
export async function upsertMedia(payload: Payload, key: ImageKey): Promise<number> {
  const { file, alt } = images[key]
  const filename = path.basename(file)
  const found = await findBy(payload, 'media', 'filename', filename)
  if (found) {
    log(`media ${filename}: exists, skipped`)
    return found.id
  }
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath: path.join(root, file) })
  log(`media ${filename}: uploaded`)
  return doc.id
}

/**
 * Fractional-index keys for Payload's `orderable` collections, in display order:
 * a0, a1, … a9, aA, … (valid keys for the `_order` field).
 */
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
export const orderKey = (i: number) => `a${DIGITS[i]}`
