'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type ContactOptionCard = { id: string; label: string; visible: boolean; order: string }

async function readOptions(): Promise<ContactOptionCard[]> {
  const response = await fetch('/api/contact-options?limit=1000&sort=_order', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh contact options.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => ({ id: String(doc.id), label: String(doc.label ?? ''), visible: Boolean(doc.visible), order: String(doc._order ?? '') }))
}

export default function ContactOptionsClient({ initialOptions }: { initialOptions: ContactOptionCard[] }) {
  const router = useRouter()
  const [options, setOptions] = useState(initialOptions)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const visible = options.filter((option) => option.visible)

  const refresh = async () => { setOptions(await readOptions()); router.refresh() }
  const startAdd = () => { setEditing('new'); setLabel(''); setFeedback('') }
  const startEdit = (option: ContactOptionCard) => { setEditing(option.id); setLabel(option.label); setFeedback('') }

  const save = async () => {
    const value = label.trim()
    if (!value) { setFeedback('Enter an option label before saving.'); return }
    const isNew = editing === 'new'
    const id = editing ?? 'new'
    setBusy(id)
    setFeedback('')
    try {
      const response = await fetch(isNew ? '/api/contact-options' : `/api/contact-options/${encodeURIComponent(id)}`, {
        method: isNew ? 'POST' : 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: value, ...(isNew ? { visible: true } : {}) }),
      })
      if (!response.ok) throw new Error('Contact option could not be saved.')
      setEditing(null)
      await refresh()
      setFeedback(isNew ? 'Contact option added.' : 'Contact option renamed.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Contact option could not be saved.')
    } finally { setBusy(null) }
  }

  const toggle = async (option: ContactOptionCard) => {
    setBusy(option.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/contact-options/${encodeURIComponent(option.id)}`, {
        method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !option.visible }),
      })
      if (!response.ok) throw new Error('Visibility could not be updated.')
      await refresh()
      setFeedback(option.visible ? 'Option hidden from your site.' : 'Option shown on your site.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Visibility could not be updated.')
    } finally { setBusy(null) }
  }

  const remove = async (option: ContactOptionCard) => {
    if (!window.confirm(`Delete “${option.label}”? This cannot be undone.`)) return
    setBusy(option.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/contact-options/${encodeURIComponent(option.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Contact option could not be deleted.')
      await refresh()
      setFeedback('Contact option deleted.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Contact option could not be deleted.')
    } finally { setBusy(null) }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const option = options[index]
    const target = options[index + direction]
    if (!option || !target || busy) return
    setBusy(option.id)
    setFeedback('')
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionSlug: 'contact-options', docsToMove: [option.id], newKeyWillBe: direction < 0 ? 'less' : 'greater', orderableFieldName: '_order', target: { id: target.id, key: target.order } }),
      })
      if (!response.ok) throw new Error('Contact option order could not be updated.')
      await refresh()
      setFeedback('Contact option order saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Contact option order could not be updated.')
    } finally { setBusy(null) }
  }

  return <section className="ms-options" aria-labelledby="ms-options-heading">
    <header className="ms-options-heading">
      <div><span className="ms-lbl">Website</span><h1 className="ms-projects-title" id="ms-options-heading">Contact options</h1><p className="ms-sub">The “What do you need?” buttons on your contact form.</p></div>
      <button className="ms-pill solid" type="button" onClick={startAdd} disabled={editing !== null}>+ Add option</button>
    </header>
    <section className="ms-card ms-options-preview" aria-label="How it looks on your site">
      <span className="ms-lbl">How it looks on your site</span>
      <div className="ms-options-preview-pills">{visible.map((option) => <span className="ms-option-preview-pill" key={option.id}>{option.label}</span>)}{visible.length === 0 && <span className="ms-hint">No contact options are visible.</span>}</div>
    </section>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    <div className="ms-options-list">
      {editing === 'new' && <OptionEditor label={label} setLabel={setLabel} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === 'new'} />}
      {options.map((option, index) => editing === option.id
        ? <OptionEditor key={option.id} label={label} setLabel={setLabel} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === option.id} />
        : <article className="ms-option-row" key={option.id}>
          <div className="ms-option-label"><strong>{option.label}</strong><span className={option.visible ? 'visible' : ''}>{option.visible ? 'On your site' : 'Hidden from your site'}</span></div>
          <div className="ms-option-actions">
            <button className={`ms-toggle${option.visible ? ' is-on' : ''}`} type="button" role="switch" aria-checked={option.visible} aria-label={`${option.visible ? 'Hide' : 'Show'} ${option.label} on site`} disabled={Boolean(busy) || editing !== null} onClick={() => void toggle(option)}><span /></button>
            <button className="ms-ib" type="button" aria-label={`Move ${option.label} up`} disabled={index === 0 || Boolean(busy)} onClick={() => void move(index, -1)}>↑</button>
            <button className="ms-ib" type="button" aria-label={`Move ${option.label} down`} disabled={index === options.length - 1 || Boolean(busy)} onClick={() => void move(index, 1)}>↓</button>
            <button className="ms-pill sm" type="button" disabled={editing !== null} onClick={() => startEdit(option)}>Rename</button>
            <button className="ms-pill sm danger" type="button" disabled={Boolean(busy) || editing !== null} onClick={() => void remove(option)}>Delete</button>
          </div>
        </article>)}
      {options.length === 0 && editing !== 'new' && <p className="ms-projects-empty">No contact options yet.</p>}
    </div>
  </section>
}

function OptionEditor({ label, setLabel, onSave, onCancel, busy }: {
  label: string
  setLabel: (label: string) => void
  onSave: () => void
  onCancel: () => void
  busy: boolean
}) {
  return <article className="ms-option-row is-editing">
    <input autoFocus className="ms-skill-input ms-option-input" aria-label="Option label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Option label" />
    <div className="ms-option-actions"><button className="ms-pill sm solid" type="button" disabled={busy} onClick={onSave}>Save</button><button className="ms-pill sm" type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </article>
}
