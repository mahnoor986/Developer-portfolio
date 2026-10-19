'use client'

import { useAllFormFields, useFormBackgroundProcessing, useFormModified, useFormProcessing } from '@payloadcms/ui'
import { useState } from 'react'

type FieldState = { value?: unknown }

const fieldValue = (fields: Record<string, FieldState>, path: string, fallback: string) => {
  const value = fields[path]?.value
  return typeof value === 'string' ? value : fallback
}

export function EmailSettingsPreview() {
  const [fields] = useAllFormFields()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const backgroundProcessing = useFormBackgroundProcessing()
  const saving = processing || backgroundProcessing
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const email = fieldValue(fields, 'notifyEmail', 'mahnoorrr41@gmail.com')
  const subject = fieldValue(fields, 'autoReplySubject', 'Thanks for your message')
  const body = fieldValue(fields, 'autoReplyBody', "Thanks for getting in touch! I've received your message and I'll get back to you within a couple of days.\n\nMahnoor")
  const autoReplyEnabled = Boolean(fields.autoReplyEnabled?.value)

  const sendTest = async () => {
    setSending(true)
    setFeedback('')
    try {
      const response = await fetch('/api/email-settings/test', { method: 'POST', credentials: 'same-origin' })
      const result = await response.json() as { message?: string }
      if (!response.ok) throw new Error(result.message || 'The test email could not be sent.')
      setFeedback(result.message || 'Test email sent.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'The test email could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return <section className="ms-email-settings" aria-labelledby="ms-email-title">
    <header className="ms-email-heading">
      <div><span className="ms-lbl">Settings</span><h1 className="ms-projects-title" id="ms-email-title">Email settings</h1><p className="ms-sub">Private. Never shown on your website.</p></div>
      <span className="ms-settings-save-state" aria-live="polite">{saving ? 'Saving…' : modified ? 'Unsaved changes' : 'All changes saved'}</span>
    </header>
    <div className="ms-email-layout">
      <section className="ms-email-card ms-email-preview-card" aria-label="Automatic reply preview">
        <span className="ms-lbl">What the client receives</span>
        <div className="ms-email-letter">
          <span className="ms-email-from">From: Mahnoor Siddiqui · To: {email || 'client@example.com'}</span>
          <strong>{subject || 'Thanks for your message'}</strong>
          <p>Hi Ayesha,<br /><br />{body}</p>
        </div>
        {!autoReplyEnabled && <p className="ms-email-muted" role="note">Automatic reply is off, so clients will not receive this email.</p>}
      </section>
      <section className="ms-email-card ms-email-test-card" aria-label="Test email">
        <span className="ms-lbl">Check your delivery</span>
        <p className="ms-sub">Send a test message to the alert address saved in these settings.</p>
        <button className="ms-pill" type="button" disabled={sending || !email} onClick={() => void sendTest()}>
          {sending ? 'Sending…' : 'Send me a test email'}
        </button>
        {feedback && <p className="ms-email-feedback" role="status">{feedback}</p>}
      </section>
    </div>
  </section>
}
