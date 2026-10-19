'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export type SkillCategory = 'fe' | 'be' | 'tl'
export type SkillCard = { id: string; name: string; category: SkillCategory; blurb: string; order: string }
type SkillDraft = Pick<SkillCard, 'name' | 'category' | 'blurb'>
type Filter = 'all' | SkillCategory

const categories: { value: SkillCategory; label: string }[] = [
  { value: 'fe', label: 'Frontend' },
  { value: 'be', label: 'Backend' },
  { value: 'tl', label: 'Tools' },
]
const filters: { value: Filter; label: string }[] = [{ value: 'all', label: 'All' }, ...categories]
const emptyDraft = (category: SkillCategory = 'fe'): SkillDraft => ({ name: '', category, blurb: '' })

async function readSkills(): Promise<SkillCard[]> {
  const response = await fetch('/api/skills?limit=1000&sort=_order', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh skills.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => ({
    id: String(doc.id),
    name: String(doc.name ?? ''),
    category: doc.category === 'be' || doc.category === 'tl' ? doc.category : 'fe',
    blurb: String(doc.blurb ?? ''),
    order: String(doc._order ?? ''),
  }))
}

export default function SkillsClient({ initialSkills }: { initialSkills: SkillCard[] }) {
  const router = useRouter()
  const [skills, setSkills] = useState(initialSkills)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<SkillDraft>(emptyDraft())
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const visible = useMemo(() => skills.filter((skill) => {
    const matchesCategory = filter === 'all' || skill.category === filter || editing === skill.id
    const search = query.trim().toLocaleLowerCase()
    const matchesSearch = !search || `${skill.name} ${skill.blurb}`.toLocaleLowerCase().includes(search) || editing === skill.id
    return matchesCategory && matchesSearch
  }), [editing, filter, query, skills])

  const refresh = async () => {
    setSkills(await readSkills())
    router.refresh()
  }

  const startEdit = (skill: SkillCard) => {
    setEditing(skill.id)
    setDraft({ name: skill.name, category: skill.category, blurb: skill.blurb })
    setFeedback('')
  }

  const startAdd = () => {
    setFilter(filter === 'all' ? 'all' : filter)
    setQuery('')
    setEditing('new')
    setDraft(emptyDraft(filter === 'all' ? 'fe' : filter))
    setFeedback('')
  }

  const save = async () => {
    const name = draft.name.trim()
    if (!name) {
      setFeedback('Enter a skill name before saving.')
      return
    }
    setBusy(editing ?? 'new')
    setFeedback('')
    try {
      const isNew = editing === 'new'
      const response = await fetch(isNew ? '/api/skills' : `/api/skills/${encodeURIComponent(editing ?? '')}`, {
        method: isNew ? 'POST' : 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, name }),
      })
      if (!response.ok) throw new Error('Skill could not be saved.')
      setEditing(null)
      await refresh()
      setFeedback(isNew ? 'Skill added.' : 'Skill saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Skill could not be saved.')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (skill: SkillCard) => {
    if (!window.confirm(`Delete “${skill.name}”? This cannot be undone.`)) return
    setBusy(skill.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/skills/${encodeURIComponent(skill.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Skill could not be deleted.')
      await refresh()
      setFeedback('Skill deleted.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Skill could not be deleted.')
    } finally {
      setBusy(null)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const skill = visible[index]
    const target = visible[index + direction]
    if (!skill || !target || busy) return
    setBusy(skill.id)
    setFeedback('')
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionSlug: 'skills',
          docsToMove: [skill.id],
          newKeyWillBe: direction < 0 ? 'less' : 'greater',
          orderableFieldName: '_order',
          target: { id: target.id, key: target.order },
        }),
      })
      if (!response.ok) throw new Error('Skill order could not be updated.')
      await refresh()
      setFeedback('Skill order saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Skill order could not be updated.')
    } finally {
      setBusy(null)
    }
  }

  return <section className="ms-skills" aria-labelledby="ms-skills-heading">
    <header className="ms-skills-heading">
      <div><span className="ms-lbl">Website</span><h1 className="ms-projects-title" id="ms-skills-heading">Skills</h1><p className="ms-sub">Shown in the Toolkit cards and the 3D skill sphere.</p></div>
      <button className="ms-pill solid" type="button" onClick={startAdd} disabled={editing !== null}>+ Add skill</button>
    </header>
    <div className="ms-skills-toolbar">
      <div className="ms-projects-filters" role="group" aria-label="Filter skills">
        {filters.map((item) => {
          const count = item.value === 'all' ? skills.length : skills.filter((skill) => skill.category === item.value).length
          return <button key={item.value} type="button" className={`ms-pill${filter === item.value ? ' on' : ''}`} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}<span className="n">{count}</span>
          </button>
        })}
      </div>
      <label className="ms-projects-search">
        <span className="ms-projects-search-icon" aria-hidden="true">⌕</span>
        <span className="ms-visually-hidden">Search skills</span>
        <input type="search" aria-label="Search skills" placeholder="Search skills" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
    </div>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    <div className="ms-skills-grid">
      {editing === 'new' && <article className="ms-skill-card is-editing">
        <SkillEditor draft={draft} setDraft={setDraft} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === 'new'} />
      </article>}
      {visible.map((skill, index) => <article className={`ms-skill-card${editing === skill.id ? ' is-editing' : ''}`} key={skill.id}>
        {editing === skill.id ? <SkillEditor draft={draft} setDraft={setDraft} onSave={() => void save()} onCancel={() => setEditing(null)} busy={busy === skill.id} /> : <>
          <div className="ms-skill-copy">
            <div className="ms-skill-title"><h2>{skill.name}</h2><span className="ms-skill-category">{categories.find((category) => category.value === skill.category)?.label}</span></div>
            {skill.blurb && <p>{skill.blurb}</p>}
          </div>
          <div className="ms-skill-actions">
            <button className="ms-ib" type="button" aria-label={`Move ${skill.name} up`} disabled={index === 0 || Boolean(busy)} onClick={() => void move(index, -1)}>↑</button>
            <button className="ms-ib" type="button" aria-label={`Move ${skill.name} down`} disabled={index === visible.length - 1 || Boolean(busy)} onClick={() => void move(index, 1)}>↓</button>
            <button className="ms-pill sm" type="button" onClick={() => startEdit(skill)} disabled={editing !== null}>Edit</button>
            <button className="ms-ib danger" type="button" aria-label={`Delete ${skill.name}`} disabled={Boolean(busy) || editing !== null} onClick={() => void remove(skill)}>×</button>
          </div>
        </>}
      </article>)}
      {visible.length === 0 && editing !== 'new' && <p className="ms-projects-empty">{skills.length ? 'No skills match.' : 'No skills yet.'}</p>}
    </div>
  </section>
}

function SkillEditor({ draft, setDraft, onSave, onCancel, busy }: {
  draft: SkillDraft
  setDraft: (draft: SkillDraft) => void
  onSave: () => void
  onCancel: () => void
  busy: boolean
}) {
  return <div className="ms-skill-editor">
    <label><span className="ms-visually-hidden">Skill name</span><input autoFocus className="ms-skill-input" aria-label="Skill name" placeholder="Skill name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
    <label><span className="ms-visually-hidden">Short line</span><input className="ms-skill-input" aria-label="Short line" placeholder="Short line" value={draft.blurb} onChange={(event) => setDraft({ ...draft, blurb: event.target.value })} /></label>
    <label><span className="ms-visually-hidden">Category</span><select className="ms-skill-input" aria-label="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as SkillCategory })}>
      {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
    </select></label>
    <div className="ms-skill-editor-actions">
      <button className="ms-pill sm solid" type="button" disabled={busy} onClick={onSave}>Save</button>
      <button className="ms-pill sm" type="button" disabled={busy} onClick={onCancel}>Cancel</button>
    </div>
  </div>
}
