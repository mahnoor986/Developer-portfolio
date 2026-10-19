import type { ListViewServerProps } from 'payload'

import { getMediaUsage } from '../lib/mediaUsage'
import MediaClient, { type MediaCard } from './MediaClient'

/** Authenticated media grid with relationship-safe deletion. */
export default async function Media({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const [result, usage] = await Promise.all([
    payload.find({ collection: 'media', depth: 0, limit: 1000, sort: '-createdAt', user, overrideAccess: false }),
    getMediaUsage(payload, user),
  ])

  const files: MediaCard[] = result.docs.map((file) => ({
    id: String(file.id),
    filename: file.filename ?? 'Untitled file',
    alt: file.alt ?? '',
    mimeType: file.mimeType ?? 'application/octet-stream',
    filesize: file.filesize ?? 0,
    width: file.width ?? null,
    height: file.height ?? null,
    url: file.url ?? null,
    inUseBy: usage.get(String(file.id)) ?? [],
  }))
  return <MediaClient initialFiles={files} />
}
