import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/content'

/**
 * Turns on Next.js draft mode for the Live Preview iframe.
 * Needs both the PREVIEW_SECRET and a logged-in admin (the admin's cookie is sent with the iframe request).
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const path = req.nextUrl.searchParams.get('path') || '/'

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid preview secret', { status: 401 })
  }
  // Only same-site paths, so this can't be used as an open redirect.
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid path', { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('Log in to the admin to preview drafts', { status: 403 })

  ;(await draftMode()).enable()
  redirect(path)
}
