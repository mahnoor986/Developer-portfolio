export class EmailJSConfigurationError extends Error {
  constructor() {
    super('EmailJS server configuration is incomplete.')
    this.name = 'EmailJSConfigurationError'
  }
}

export class EmailJSRequestError extends Error {
  constructor(readonly status: number) {
    super(`EmailJS request failed with status ${status}.`)
    this.name = 'EmailJSRequestError'
  }
}

export const escapeEmailHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)

export const toEmailHtml = (value: string) => escapeEmailHtml(value).replace(/\r?\n/g, '<br>')

export async function sendEmailJsTemplate(
  templateId: string | undefined,
  templateParams: Record<string, string>,
) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY
  const fromEmail = process.env.EMAILJS_FROM_ADDRESS
  const origin = process.env.NEXT_PUBLIC_SERVER_URL

  if (!serviceId || !publicKey || !privateKey || !fromEmail || !templateId) {
    throw new EmailJSConfigurationError()
  }

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

  if (!response.ok) throw new EmailJSRequestError(response.status)
}
