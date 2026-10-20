'use client'

import { useRef, useState, useTransition } from 'react'

import { sendMessage } from '@/app/(frontend)/actions/sendMessage'
import { contactSchema, HONEYPOT_FIELD, type ContactField } from '@/lib/contactSchema'

type Props = {
  options: { id: number; label: string }[]
  labels: {
    options?: string | null
    name?: string | null
    email?: string | null
    message?: string | null
    send?: string | null
    note?: string | null
    success?: string | null
    error?: string | null
    rateLimit?: string | null
    sendError?: string | null
  }
}

const fieldIds: Record<ContactField, string> = { name: 'fName', email: 'fEmail', message: 'fMsg' }

/** Same markup and classes as the legacy form; sends through the `sendMessage` Server Action. */
export function ContactForm({ options, labels }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const submitting = useRef(false)
  const [bad, setBad] = useState<ContactField[]>([])
  const [note, setNote] = useState<{ cls: '' | 'good' | 'bad'; text: string }>({ cls: '', text: labels.note ?? '' })
  const [pending, startTransition] = useTransition()

  function showInvalid(fields: ContactField[]) {
    setBad(fields)
    setNote({ cls: 'bad', text: labels.error ?? '' })
    if (fields[0]) document.getElementById(fieldIds[fields[0]])?.focus()
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending || submitting.current) return
    const form = e.currentTarget
    const data = new FormData(form)
    data.set('pageUrl', window.location.href)

    // Quick check in the browser so the visitor gets instant feedback; the server checks again.
    const check = contactSchema.safeParse({
      name: data.get('name'),
      email: data.get('email'),
      message: data.get('message'),
    })
    if (!check.success) {
      const fields = (['name', 'email', 'message'] as const).filter((f) =>
        check.error.issues.some((i) => i.path[0] === f),
      )
      showInvalid(fields)
      return
    }
    setBad([])

    submitting.current = true
    startTransition(async () => {
      try {
        const res = await sendMessage(data).catch(() => ({ ok: false as const, reason: 'error' as const }))
        if (res.ok) {
          formRef.current?.reset()
          setNote({ cls: 'good', text: labels.success ?? '' })
        } else if (res.reason === 'invalid') {
          showInvalid(res.fields)
        } else if (res.reason === 'delivery-error') {
          formRef.current?.reset()
          setNote({
            cls: 'bad',
            text: 'Your message was saved, but email delivery could not be confirmed. Please email me directly if you need a quick response.',
          })
        } else {
          setNote({ cls: 'bad', text: (res.reason === 'rate-limited' ? labels.rateLimit : labels.sendError) ?? '' })
        }
      } finally {
        submitting.current = false
      }
    })
  }

  const fieldClass = (f: ContactField) => (bad.includes(f) ? 'field err' : 'field')

  return (
    <form className="collab-form" id="collabForm" noValidate ref={formRef} onSubmit={onSubmit} aria-busy={pending}>
      {options.length > 0 && (
        <fieldset className="opts">
          <legend>{labels.options}</legend>
          {options.map((o, i) => (
            <label className="opt" key={o.id}>
              <input type="radio" name="type" value={o.label} defaultChecked={i === 0} />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="row2">
        <div className={fieldClass('name')}>
          <input id="fName" name="name" type="text" placeholder=" " autoComplete="name" maxLength={120} required />
          <label htmlFor="fName">{labels.name}</label>
        </div>
        <div className={fieldClass('email')}>
          <input id="fEmail" name="email" type="email" placeholder=" " autoComplete="email" maxLength={254} required />
          <label htmlFor="fEmail">{labels.email}</label>
        </div>
      </div>
      <div className={fieldClass('message')}>
        <textarea id="fMsg" name="message" rows={5} placeholder=" " maxLength={5000} required />
        <label htmlFor="fMsg">{labels.message}</label>
      </div>
      {/* Honeypot: invisible to people and screen readers, tempting for bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="fCompany">Company</label>
        <input id="fCompany" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-foot">
        <p className={note.cls ? `form-note ${note.cls}` : 'form-note'} id="formNote" role="status" aria-live="polite">
          {note.text}
        </p>
        <button className="send" type="submit" data-magnetic="" aria-disabled={pending}>
          <span>{labels.send}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </form>
  )
}
