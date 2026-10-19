import { getPayloadClient } from '@/lib/content'

export async function POST(request: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ message: 'Sign in to send a test email.' }, { status: 401 })
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ message: 'Email delivery is not configured yet. Add a Resend API key first.' }, { status: 503 })
  }

  const settings = await payload.findGlobal({ slug: 'email-settings', user, overrideAccess: false, depth: 0 })
  if (!settings.notifyEmail) {
    return Response.json({ message: 'Add an alert email address before sending a test.' }, { status: 400 })
  }

  try {
    await payload.sendEmail({
      to: settings.notifyEmail,
      subject: 'Test email from Mahnoor Portfolio',
      text: 'Your portfolio email settings are connected and ready to send new-message alerts.',
      html: '<p>Your portfolio email settings are connected and ready to send new-message alerts.</p>',
    })
    return Response.json({ message: `Test email sent to ${settings.notifyEmail}.` })
  } catch (error) {
    payload.logger.error({ err: error }, 'Portfolio email test failed')
    return Response.json({ message: 'The test email could not be sent. Check the email provider configuration.' }, { status: 502 })
  }
}
