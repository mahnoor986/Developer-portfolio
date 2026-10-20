import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  EmailJSConfigurationError,
  EmailJSRequestError,
  escapeEmailHtml,
  sendEmailJsTemplate,
  toEmailHtml,
} from '@/lib/emailjs'
import { sendPayloadEmail } from '@/lib/emailjsPayloadAdapter'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

const configureEmailJS = () => {
  vi.stubEnv('NEXT_PUBLIC_EMAILJS_SERVICE_ID', 'service-placeholder')
  vi.stubEnv('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY', 'public-key-placeholder')
  vi.stubEnv('NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID', 'transactional-template-placeholder')
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://portfolio.example')
  vi.stubEnv('EMAILJS_PRIVATE_KEY', 'private-key-placeholder')
  vi.stubEnv('EMAILJS_FROM_ADDRESS', 'sender@example.com')
}

describe('EmailJS server delivery', () => {
  it('escapes untrusted values before they are inserted into HTML email templates', () => {
    expect(escapeEmailHtml(`<script title="x">&'`)).toBe('&lt;script title=&quot;x&quot;&gt;&amp;&#39;')
    expect(toEmailHtml('Hello\nworld')).toBe('Hello<br>world')
  })

  it('uses the configured service, template, credentials, and template parameters', async () => {
    configureEmailJS()
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await sendEmailJsTemplate('template-placeholder', { to_email: 'owner@example.com', message: 'Hello' })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, request] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send')
    expect(request?.headers).toEqual({
      'Content-Type': 'application/json',
      Origin: 'https://portfolio.example',
    })
    expect(JSON.parse(String(request?.body))).toEqual({
      service_id: 'service-placeholder',
      template_id: 'template-placeholder',
      user_id: 'public-key-placeholder',
      accessToken: 'private-key-placeholder',
      template_params: { to_email: 'owner@example.com', message: 'Hello', from_email: 'sender@example.com' },
    })
  })

  it('does not make a request when server configuration is incomplete', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendEmailJsTemplate('template-placeholder', {})).rejects.toBeInstanceOf(EmailJSConfigurationError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('surfaces provider rejection without returning success', async () => {
    configureEmailJS()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 429 })))

    await expect(sendEmailJsTemplate('template-placeholder', {})).rejects.toEqual(new EmailJSRequestError(429))
  })

  it('routes Payload authentication emails through the configured transaction template', async () => {
    configureEmailJS()
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await sendPayloadEmail({
      to: 'admin@example.com',
      subject: 'Reset your password',
      html: '<p>Use <a href="https://portfolio.example/reset">this reset link</a>.</p>',
    })

    const [, request] = fetchMock.mock.calls[0]!
    const body = JSON.parse(String(request?.body)) as {
      template_id: string
      template_params: Record<string, string>
    }
    expect(body.template_id).toBe('transactional-template-placeholder')
    expect(body.template_params.to_email).toBe('admin@example.com')
    expect(body.template_params.subject).toBe('Reset your password')
    expect(body.template_params.message).toContain('https://portfolio.example/reset')
    expect(body.template_params.message_html).toContain('href="https://portfolio.example/reset"')
  })
})
