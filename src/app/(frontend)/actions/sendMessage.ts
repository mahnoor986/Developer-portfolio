'use server'

import { createHash } from 'crypto'
import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/content'
import {
  contactSchema,
  HONEYPOT_FIELD,
  type ContactField,
  type SendMessageResult,
} from '@/lib/contactSchema'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

/** One-way hash so the raw IP is never stored. Salted with the Payload secret. */
function hashIp(ip: string) {
  return createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${ip}`)
    .digest('hex')
}

async function clientIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

export async function sendMessage(formData: FormData): Promise<SendMessageResult> {
  // Honeypot filled → pretend it worked, store nothing.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').trim()) return { ok: true }

  const parsed = contactSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    message: formData.get('message') ?? '',
    projectType: formData.get('type') ?? '',
    pageUrl: formData.get('pageUrl') ?? '',
  })
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => i.path[0]))].filter(
      (f): f is ContactField => f === 'name' || f === 'email' || f === 'message',
    )
    return { ok: false, reason: 'invalid', fields }
  }

  try {
    const payload = await getPayloadClient()
    const ipHash = hashIp(await clientIp())

    const recent = await payload.count({
      collection: 'messages',
      overrideAccess: true,
      where: {
        and: [
          { ipHash: { equals: ipHash } },
          { createdAt: { greater_than: new Date(Date.now() - RATE_WINDOW_MS).toISOString() } },
        ],
      },
    })
    if (recent.totalDocs >= RATE_LIMIT) return { ok: false, reason: 'rate-limited' }

    // Only accept project types that are actually offered on the form.
    const { docs: options } = await payload.find({
      collection: 'contact-options',
      where: { visible: { equals: true } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    const { projectType, ...data } = parsed.data
    const type = options.some((o) => o.label === projectType) ? projectType : ''

    await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: { ...data, projectType: type, ipHash, status: 'new' },
    })
    return { ok: true }
  } catch (err) {
    console.error('[sendMessage] failed to save message', err)
    return { ok: false, reason: 'error' }
  }
}
