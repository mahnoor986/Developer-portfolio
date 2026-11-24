export class EmailJSConfigurationError extends Error {
  /** Names (never values) of the environment variables that are empty. */
  constructor(readonly missing: string[]) {
    super(`EmailJS server configuration is incomplete. Missing: ${missing.join(', ')}.`)
    this.name = 'EmailJSConfigurationError'
  }
}

export class EmailJSRequestError extends Error {
  /** `detail` is EmailJS's own reply text, e.g. "The Public Key is invalid". It never contains our keys. */
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(`EmailJS request failed with status ${status}${detail ? `: ${detail}` : ''}.`)
    this.name = 'EmailJSRequestError'
  }
}

/** A short, safe explanation of a failed send, for logs and the admin test button. */
export const describeEmailError = (err: unknown) =>
  err instanceof EmailJSConfigurationError || err instanceof EmailJSRequestError
    ? err.message
    : 'Unexpected error while contacting EmailJS.'

export const escapeEmailHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)

export const toEmailHtml = (value: string) => escapeEmailHtml(value).replace(/\r?\n/g, '<br>')

export async function sendEmailJsTemplate(
  templateId: string | undefined,
  templateParams: Record<string, string>,
  templateVariable = 'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY
  const fromEmail = process.env.EMAILJS_FROM_ADDRESS
  const origin = process.env.NEXT_PUBLIC_SERVER_URL

  const missing = Object.entries({
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: serviceId,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: publicKey,
    EMAILJS_PRIVATE_KEY: privateKey,
    EMAILJS_FROM_ADDRESS: fromEmail,
    [templateVariable]: templateId,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name)
  if (missing.length) throw new EmailJSConfigurationError(missing)

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: { ...templateParams, from_email: fromEmail },
    }),
  })

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 200)
    throw new EmailJSRequestError(response.status, detail)
  }
}
