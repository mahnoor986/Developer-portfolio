import type { EmailAdapter, SendEmailOptions } from 'payload'

import { sendEmailJsTemplate, toEmailHtml } from './emailjs'

function getAddress(value: unknown): { address: string; name?: string } {
  if (typeof value === 'string' && value.trim()) return { address: value.trim() }

  if (Array.isArray(value)) {
    if (value.length !== 1) throw new Error('EmailJS supports one recipient per Payload email.')
    return getAddress(value[0])
  }

  if (value && typeof value === 'object' && 'address' in value && typeof value.address === 'string') {
    return { address: value.address, name: 'name' in value && typeof value.name === 'string' ? value.name : undefined }
  }

  throw new Error('Payload email requires one recipient address.')
}

function htmlToText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim()
}

export async function sendPayloadEmail(message: SendEmailOptions) {
  const recipient = getAddress(message.to)
  const html = typeof message.html === 'string' ? message.html : ''
  const text = typeof message.text === 'string' ? message.text : htmlToText(html)
  const replyTo = message.replyTo ? getAddress(message.replyTo).address : ''

  await sendEmailJsTemplate(process.env.NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID, {
    to_email: recipient.address,
    to_name: recipient.name || '',
    reply_to: replyTo,
    subject: typeof message.subject === 'string' ? message.subject : '',
    message: text,
    message_html: html || toEmailHtml(text),
  })
}

export const emailJsPayloadAdapter: EmailAdapter = () => ({
  name: 'emailjs',
  defaultFromAddress: process.env.EMAILJS_FROM_ADDRESS || '',
  defaultFromName: 'Mahnoor Portfolio',
  sendEmail: sendPayloadEmail,
})
