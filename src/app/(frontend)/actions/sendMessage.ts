'use server'

import { createHash } from 'crypto'
import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/content'
import { EmailJSRequestError, escapeEmailHtml, sendEmailJsTemplate, toEmailHtml } from '@/lib/emailjs'
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
    const normalizedProjectType = options.some((o) => o.label === projectType) ? projectType : ''

    const savedMessage = await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: { ...data, projectType: normalizedProjectType, ipHash, status: 'new' },
    })

    const settings = await payload.findGlobal({ slug: 'email-settings', depth: 0, overrideAccess: true }).catch(() => {
      payload.logger.error({ messageId: savedMessage.id }, 'Email settings could not be read after saving a message')
      return null
    })
    if (!settings) return { ok: false, reason: 'delivery-error' }

    let deliveryFailed = false
    const subjectName = savedMessage.name.replace(/[\r\n]+/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '')
    const projectTypeSuffix = savedMessage.projectType ? ` (${savedMessage.projectType.replace(/[\r\n]+/g, ' ')})` : ''
    const adminUrl = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin/collections/messages/${savedMessage.id}`
    try {
      await sendEmailJsTemplate(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, {
        to_email: settings.notifyEmail,
        reply_to: savedMessage.email,
        subject: `New message from ${subjectName}${projectTypeSuffix}`,
        name: savedMessage.name,
        name_html: escapeEmailHtml(savedMessage.name),
        email: savedMessage.email,
        email_html: escapeEmailHtml(savedMessage.email),
        project_type: savedMessage.projectType || 'Not specified',
        project_type_html: escapeEmailHtml(savedMessage.projectType || 'Not specified'),
        message: savedMessage.message,
        message_html: toEmailHtml(savedMessage.message),
        page_url: savedMessage.pageUrl || '',
        page_url_html: escapeEmailHtml(savedMessage.pageUrl || ''),
        admin_url: adminUrl,
        admin_url_html: escapeEmailHtml(adminUrl),
      })
    } catch (err) {
      const status = err instanceof EmailJSRequestError ? err.status : undefined
      payload.logger.error({ status }, `EmailJS notification failed for message ${savedMessage.id}`)
      deliveryFailed = true
    }

    if (settings.autoReplyEnabled && settings.autoReplyBody) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const autoReply = settings.autoReplyBody.replaceAll('{name}', savedMessage.name)
        await sendEmailJsTemplate(process.env.NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID, {
          to_email: savedMessage.email,
          reply_to: settings.notifyEmail,
          to_name: savedMessage.name,
          to_name_html: escapeEmailHtml(savedMessage.name),
          subject: settings.autoReplySubject || 'Thanks for your message',
          message: autoReply,
          message_html: toEmailHtml(autoReply),
        })
      } catch (err) {
        const status = err instanceof EmailJSRequestError ? err.status : undefined
        payload.logger.error({ status }, `EmailJS auto-reply failed for message ${savedMessage.id}`)
        deliveryFailed = true
      }
    }

    if (deliveryFailed) return { ok: false, reason: 'delivery-error' }
    return { ok: true }
  } catch (err) {
    console.error('[sendMessage] failed to save contact message', err instanceof Error ? err.name : 'Unknown error')
    return { ok: false, reason: 'error' }
  }
}
