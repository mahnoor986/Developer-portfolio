import { getPayloadClient } from '@/lib/content'
import { sendEmailJsTemplate } from '@/lib/emailjs'

export async function POST(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ message: 'Sign in to send a test email.' }, { status: 401 })
  const settings = await payload.findGlobal({ slug: 'email-settings', user, overrideAccess: false, depth: 0 })
  if (!settings.notifyEmail) {
    return Response.json({ message: 'Add an alert email address before sending a test.' }, { status: 400 })
  }

  try {
    await sendEmailJsTemplate(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, {
      to_email: settings.notifyEmail,
      reply_to: settings.notifyEmail,
      subject: 'EmailJS configuration test from Mahnoor Portfolio',
      name: 'Portfolio test',
      email: settings.notifyEmail,
      project_type: 'Test',
      message: 'Your portfolio email notification template is connected.',
      page_url: '',
      admin_url: `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin`,
    })
    return Response.json({ message: `Test email sent to ${settings.notifyEmail}.` })
  } catch (error) {
    payload.logger.error({ err: error }, 'EmailJS configuration test failed')
    return Response.json({ message: 'The test email could not be sent. Check the EmailJS service, template, and server environment configuration.' }, { status: 502 })
  }
}
