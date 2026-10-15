import { after } from 'next/server'
import type { CollectionAfterChangeHook, Payload } from 'payload'

import type { Message } from '@/payload-types'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const toHtml = (text: string) => escapeHtml(text).replace(/\r?\n/g, '<br>')

/** New-message alert to Mahnoor, plus the optional auto-reply to the sender. */
async function sendMessageEmails(payload: Payload, msg: Message) {
  const settings = await payload.findGlobal({ slug: 'email-settings', depth: 0 })
  const adminUrl = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin/collections/messages/${msg.id}`
  const type = msg.projectType ? ` (${msg.projectType})` : ''

  const jobs: Promise<unknown>[] = []

  if (settings.notifyEmail) {
    const lines = [
      `Name: ${msg.name}`,
      `Email: ${msg.email}`,
      msg.projectType ? `Project type: ${msg.projectType}` : '',
      '',
      msg.message,
      '',
      `Open in the admin: ${adminUrl}`,
    ].filter((l, i, all) => l !== '' || all[i - 1] !== '')
    jobs.push(
      payload.sendEmail({
        to: settings.notifyEmail,
        replyTo: msg.email,
        subject: `New message from ${msg.name}${type}`,
        text: lines.join('\n'),
        html: `<p><strong>Name:</strong> ${escapeHtml(msg.name)}<br><strong>Email:</strong> <a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a>${msg.projectType ? `<br><strong>Project type:</strong> ${escapeHtml(msg.projectType)}` : ''}</p><p>${toHtml(msg.message)}</p><p><a href="${escapeHtml(adminUrl)}">Open in the admin</a> · Reply to this email to answer ${escapeHtml(msg.name)} directly.</p>`,
      }),
    )
  }

  if (settings.autoReplyEnabled && settings.autoReplyBody) {
    const body = settings.autoReplyBody.replaceAll('{name}', msg.name)
    jobs.push(
      payload.sendEmail({
        to: msg.email,
        replyTo: settings.notifyEmail || undefined,
        subject: settings.autoReplySubject || 'Thanks for your message',
        text: body,
        html: `<p>${toHtml(body)}</p>`,
      }),
    )
  }

  const results = await Promise.allSettled(jobs)
  for (const r of results) {
    if (r.status === 'rejected') payload.logger.error({ err: r.reason }, `Email for message ${msg.id} failed`)
  }
}

/**
 * Sends emails after a new message is created. Uses Next's `after()` so the contact form answers
 * right away; outside a Next.js request (scripts) it just runs in the background. Never throws.
 */
export const emailOnNewMessage: CollectionAfterChangeHook<Message> = ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipEmails) return doc

  const run = () =>
    sendMessageEmails(req.payload, doc).catch((err) =>
      req.payload.logger.error({ err }, `Emails for message ${doc.id} failed`),
    )
  try {
    after(run)
  } catch {
    void run()
  }
  return doc
}
