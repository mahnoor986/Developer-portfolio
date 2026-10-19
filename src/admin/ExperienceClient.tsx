'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type ExperienceCard = { id: string; period: string; title: string; organization: string; description: string; order: string }
type Draft = Pick<ExperienceCard, 'period' | 'title' | 'organization' | 'description'>
const emptyDraft = (): Draft => ({ period: '', title: '', organization: '', description: '' })

async function readEntries(): Promise<ExperienceCard[]> {
  const response = await fetch('/api/experience?limit=1000&sort=_order', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh experience.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => ({
    id: String(doc.id),
    period: String(doc.period ?? ''),
    title: String(doc.title ?? ''),
    organization: String(doc.organization ?? ''),
    description: String(doc.description ?? ''),
    order: String(doc._order ?? ''),
  }))
}

export default function ExperienceClient({ initialEntries }: { initialEntries: ExperienceCard[] }) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const refresh = async () => { setEntries(await readEntries()); router.refresh() }
  const startAdd = () => { setEditing('new'); setDraft(emptyDraft()); setFeedback('') }
  const startEdit = (entry: ExperienceCard) => {
    setEditing(entry.id)
    setDraft({ period: entry.period, title: entry.title, organization: entry.organization, description: entry.description })
    setFeedback('')
  }
  const save = async () => {
    const period = draft.period.trim()
    const title = draft.title.trim()
    if (!period || !title) { setFeedback('Enter a period and role title before saving.'); return }
    const isNew = editing === 'new'
    const id = editing ?? 'new'
    setBusy(id)
    setFeedback('')
    try {
      const response = await fetch(isNew ? '/api/experience' : `/api/experience/${encodeURIComponent(id)}`, {
        method: isNew ? 'POST' : 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, period, title }),
      })
      if (!response.ok) throw new Error('Experience entry could not be saved.')
      setEditing(null)
      await refresh()
      setFeedback(isNew ? 'Experience entry added.' : 'Experience entry saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Experience entry could not be saved.')
    } finally { setBusy(null) }
  }
  const remove = async (entry: ExperienceCard) => {
    if (!window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return
    setBusy(entry.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/experience/${encodeURIComponent(entry.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Experience entry could not be deleted.')
      await refresh()
      setFeedback('Experience entry deleted.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Experience entry could not be deleted.')
    } finally { setBusy(null) }
  }
  const move = async (index: number, direction: -1 | 1) => {
    const entry = entries[index]
    const target = entries[index + direction]
    if (!entry || !target || busy) return
    setBusy(entry.id)
    setFeedback('')
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionSlug: 'experience', docsToMove: [entry.id], newKeyWillBe: direction < 0 ? 'less' : 'greater', orderableFieldName: '_order', target: { id: target.id, key: target.order } }),
      })
      if (!response.ok) throw new Error('Experience order could not be updated.')
      await refresh()
      setFeedback('Experience order saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Experience order could not be updated.')
    } finally { setBusy(null) }
  }

  return <section className="ms-experience" aria-labelledby="ms-experience-heading">
    <header className="ms-experience-heading">
      <div><span className="ms-lbl">Website</span><h1 className="ms-projects-title" id="ms-experience-heading">Experience</h1><p className="ms-sub">Your timeline, newest first.</p></div>
      <button className="ms-pill solid" type="button" onClick={startAdd} disabled={editing !== null}>+ Add entry</button>
    </header>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    <div className="ms-experience-list">
      {editing === 'new' && <ExperienceEditor draft={draft} setDraft={setDraft} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === 'new'} />}
      {entries.map((entry, index) => editing === entry.id
        ? <ExperienceEditor key={entry.id} draft={draft} setDraft={setDraft} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === entry.id} />
        : <article className="ms-experience-row" key={entry.id}>
          <div className="ms-experience-copy">
            <span className="ms-lbl ms-experience-period">{entry.period}</span>
            <h2>{entry.title}</h2>
            {entry.organization && <strong>{entry.organization}</strong>}
            {entry.description && <p>{entry.description}</p>}
          </div>
          <div className="ms-step-actions">
            <button className="ms-ib" type="button" aria-label={`Move ${entry.title} up`} disabled={index === 0 || Boolean(busy)} onClick={() => void move(index, -1)}>↑</button>
            <button className="ms-ib" type="button" aria-label={`Move ${entry.title} down`} disabled={index === entries.length - 1 || Boolean(busy)} onClick={() => void move(index, 1)}>↓</button>
            <button className="ms-pill sm" type="button" disabled={editing !== null} onClick={() => startEdit(entry)}>Edit</button>
            <button className="ms-pill sm danger" type="button" disabled={Boolean(busy) || editing !== null} onClick={() => void remove(entry)}>Delete</button>
          </div>
        </article>)}
      {entries.length === 0 && editing !== 'new' && <p className="ms-projects-empty">No experience entries yet.</p>}
    </div>
  </section>
}

function ExperienceEditor({ draft, setDraft, onSave, onCancel, busy }: {
  draft: Draft
  setDraft: (draft: Draft) => void
  onSave: () => void
  onCancel: () => void
  busy: boolean
}) {
  return <article className="ms-experience-row is-editing">
    <div className="ms-experience-editor">
      <div className="ms-experience-editor-row">
        <input autoFocus className="ms-skill-input" aria-label="Period" placeholder="Aug 2026 to now" value={draft.period} onChange={(event) => setDraft({ ...draft, period: event.target.value })} />
        <input className="ms-skill-input" aria-label="Role or title" placeholder="Role or title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      </div>
      <input className="ms-skill-input" aria-label="Organization" placeholder="Organization" value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} />
      <textarea className="ms-skill-input ms-step-description-input" aria-label="Description" placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      <div className="ms-step-editor-actions"><button className="ms-pill sm solid" type="button" disabled={busy} onClick={onSave}>Save</button><button className="ms-pill sm" type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
    </div>
  </article>
}
