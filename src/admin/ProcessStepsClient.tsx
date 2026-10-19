'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { showUndoableDelete } from './toasts'

export type ProcessStepCard = { id: string; title: string; description: string; tags: string[]; order: string }
type Draft = { title: string; description: string; tags: string }
const emptyDraft = (): Draft => ({ title: '', description: '', tags: '' })

async function readSteps(): Promise<ProcessStepCard[]> {
  const response = await fetch('/api/process-steps?limit=1000&sort=_order', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh process steps.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => ({
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    order: String(doc._order ?? ''),
  }))
}

export default function ProcessStepsClient({ initialSteps }: { initialSteps: ProcessStepCard[] }) {
  const router = useRouter()
  const [steps, setSteps] = useState(initialSteps)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const refresh = async () => {
    setSteps(await readSteps())
    router.refresh()
  }
  const startAdd = () => { setEditing('new'); setDraft(emptyDraft()); setFeedback('') }
  const startEdit = (step: ProcessStepCard) => {
    setEditing(step.id)
    setDraft({ title: step.title, description: step.description, tags: step.tags.join(', ') })
    setFeedback('')
  }
  const save = async () => {
    const title = draft.title.trim()
    const description = draft.description.trim()
    if (!title || !description) { setFeedback('Enter a title and description before saving.'); return }
    const isNew = editing === 'new'
    const id = editing ?? 'new'
    setBusy(id)
    setFeedback('')
    try {
      const response = await fetch(isNew ? '/api/process-steps' : `/api/process-steps/${encodeURIComponent(id)}`, {
        method: isNew ? 'POST' : 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      })
      if (!response.ok) throw new Error('Process step could not be saved.')
      setEditing(null)
      await refresh()
      setFeedback(isNew ? 'Process step added.' : 'Process step saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Process step could not be saved.')
    } finally { setBusy(null) }
  }
  const remove = async (step: ProcessStepCard) => {
    if (!window.confirm(`Delete “${step.title}”? You can undo this for five seconds.`)) return
    const index = steps.findIndex((item) => item.id === step.id)
    showUndoableDelete({
      label: `Process step “${step.title}”`,
      remove: () => setSteps((current) => current.filter((item) => item.id !== step.id)),
      undo: () => setSteps((current) => {
        if (current.some((item) => item.id === step.id)) return current
        const next = [...current]
        next.splice(Math.min(index, next.length), 0, step)
        return next
      }),
      commit: async () => {
      const response = await fetch(`/api/process-steps/${encodeURIComponent(step.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Process step could not be deleted.')
        router.refresh()
      },
    })
  }
  const move = async (index: number, direction: -1 | 1) => {
    const step = steps[index]
    const target = steps[index + direction]
    if (!step || !target || busy) return
    setBusy(step.id)
    setFeedback('')
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionSlug: 'process-steps', docsToMove: [step.id], newKeyWillBe: direction < 0 ? 'less' : 'greater', orderableFieldName: '_order', target: { id: target.id, key: target.order } }),
      })
      if (!response.ok) throw new Error('Process step order could not be updated.')
      await refresh()
      setFeedback('Process step order saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Process step order could not be updated.')
    } finally { setBusy(null) }
  }

  return <section className="ms-steps" aria-labelledby="ms-steps-heading">
    <header className="ms-steps-heading">
      <div><span className="ms-lbl">Website</span><h1 className="ms-projects-title" id="ms-steps-heading">Process steps</h1><p className="ms-sub">The “How I build” cards, in order.</p></div>
      <button className="ms-pill solid" type="button" onClick={startAdd} disabled={editing !== null}>+ Add step</button>
    </header>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    <div className="ms-steps-list">
      {editing === 'new' && <StepEditor index={steps.length + 1} draft={draft} setDraft={setDraft} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === 'new'} />}
      {steps.map((step, index) => editing === step.id
        ? <StepEditor key={step.id} index={index + 1} draft={draft} setDraft={setDraft} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === step.id} />
        : <article className="ms-step-row" key={step.id}>
          <span className="ms-step-number" aria-label={`Step ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
          <div className="ms-step-copy">
            <h2>{step.title}</h2><p>{step.description}</p>
            {step.tags.length > 0 && <div className="ms-step-tags">{step.tags.map((tag, tagIndex) => <span className="ms-skill-category" key={`${tag}-${tagIndex}`}>{tag}</span>)}</div>}
          </div>
          <div className="ms-step-actions">
            <button className="ms-ib" type="button" aria-label={`Move ${step.title} up`} disabled={index === 0 || Boolean(busy)} onClick={() => void move(index, -1)}>↑</button>
            <button className="ms-ib" type="button" aria-label={`Move ${step.title} down`} disabled={index === steps.length - 1 || Boolean(busy)} onClick={() => void move(index, 1)}>↓</button>
            <button className="ms-pill sm" type="button" disabled={editing !== null} onClick={() => startEdit(step)}>Edit</button>
            <button className="ms-pill sm danger" type="button" disabled={Boolean(busy) || editing !== null} onClick={() => void remove(step)}>Delete</button>
          </div>
        </article>)}
      {steps.length === 0 && editing !== 'new' && <p className="ms-projects-empty">No process steps yet.</p>}
    </div>
  </section>
}

function StepEditor({ index, draft, setDraft, onSave, onCancel, busy }: {
  index: number
  draft: Draft
  setDraft: (draft: Draft) => void
  onSave: () => void
  onCancel: () => void
  busy: boolean
}) {
  return <article className="ms-step-row is-editing">
    <span className="ms-step-number" aria-hidden="true">{String(index).padStart(2, '0')}</span>
    <div className="ms-step-editor">
      <input autoFocus className="ms-skill-input" aria-label="Step title" placeholder="Step title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      <textarea className="ms-skill-input ms-step-description-input" aria-label="Step description" placeholder="Step description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      <input className="ms-skill-input" aria-label="Tags, comma separated" placeholder="Tags, comma separated" value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} />
      <div className="ms-step-editor-actions"><button className="ms-pill sm solid" type="button" disabled={busy} onClick={onSave}>Save</button><button className="ms-pill sm" type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
    </div>
  </article>
}
