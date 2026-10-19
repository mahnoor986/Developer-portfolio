'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export type ProjectCard = {
  id: string
  title: string
  category: string
  year: string
  status: 'published' | 'draft'
  imageUrl: string | null
  imageAlt: string
  order: string
}

type Filter = 'all' | 'published' | 'draft'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

async function readProjects(): Promise<ProjectCard[]> {
  const response = await fetch('/api/projects?depth=1&draft=true&limit=1000&sort=_order', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh projects.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => {
    const image = doc.image && typeof doc.image === 'object' ? doc.image as Record<string, unknown> : null
    return {
      id: String(doc.id),
      title: String(doc.title ?? ''),
      category: String(doc.category ?? ''),
      year: String(doc.year ?? ''),
      status: doc._status === 'published' ? 'published' : 'draft',
      imageUrl: typeof image?.url === 'string' ? image.url : null,
      imageAlt: typeof image?.alt === 'string' ? image.alt : '',
      order: String(doc._order ?? ''),
    }
  })
}

export default function ProjectsClient({ initialProjects }: { initialProjects: ProjectCard[] }) {
  const router = useRouter()
  const [projects, setProjects] = useState(initialProjects)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const visible = useMemo(() => projects.filter((project) => {
    const matchesFilter = filter === 'all' || project.status === filter
    const search = query.trim().toLocaleLowerCase()
    const matchesSearch = !search || `${project.title} ${project.category} ${project.year}`.toLocaleLowerCase().includes(search)
    return matchesFilter && matchesSearch
  }), [filter, projects, query])

  const refresh = async () => {
    const next = await readProjects()
    setProjects(next)
    router.refresh()
  }

  const toggleStatus = async (project: ProjectCard) => {
    setBusy(project.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _status: project.status === 'published' ? 'draft' : 'published' }),
      })
      if (!response.ok) throw new Error('Project status could not be updated.')
      await refresh()
      setFeedback(project.status === 'published' ? 'Project unpublished.' : 'Project published.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Project status could not be updated.')
    } finally {
      setBusy(null)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const project = visible[index]
    const target = visible[index + direction]
    if (!project || !target || busy) return
    setBusy(project.id)
    setFeedback('')
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionSlug: 'projects',
          docsToMove: [project.id],
          newKeyWillBe: direction < 0 ? 'less' : 'greater',
          orderableFieldName: '_order',
          target: { id: target.id, key: target.order },
        }),
      })
      if (!response.ok) throw new Error('Project order could not be updated.')
      await refresh()
      setFeedback('Project order saved.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Project order could not be updated.')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (project: ProjectCard) => {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return
    setBusy(project.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Project could not be deleted.')
      await refresh()
      setFeedback('Project deleted.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Project could not be deleted.')
    } finally {
      setBusy(null)
    }
  }

  return <main className="ms-projects">
    <header className="ms-projects-heading">
      <div><span className="ms-lbl">Website</span><h1 className="ms-projects-title">Projects</h1></div>
      <Link className="ms-pill solid" href="/admin/collections/projects/create">+ Add project</Link>
    </header>

    <div className="ms-projects-toolbar">
      <div className="ms-projects-filters" role="group" aria-label="Filter projects">
        {filters.map((item) => {
          const count = item.value === 'all' ? projects.length : projects.filter((project) => project.status === item.value).length
          return <button key={item.value} type="button" className={`ms-pill${filter === item.value ? ' on' : ''}`} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}<span className="n">{count}</span>
          </button>
        })}
      </div>
      <label className="ms-projects-search">
        <span className="ms-projects-search-icon" aria-hidden="true">⌕</span>
        <span className="ms-visually-hidden">Search projects</span>
        <input type="search" aria-label="Search projects" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
    </div>
    <p className="ms-hint">Use the arrows to change the order on your site.</p>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}

    <div className="ms-projects-list">
      {visible.map((project, index) => <article className="ms-project-row" key={project.id}>
        <div className="ms-project-thumb" role={project.imageUrl ? 'img' : undefined} aria-label={project.imageUrl ? project.imageAlt || project.title : undefined}>
          {project.imageUrl ? <span style={{ backgroundImage: `url("${project.imageUrl.replaceAll('"', '%22')}")` }} /> : <span className="ms-project-thumb-empty">PROJECT</span>}
        </div>
        <div className="ms-project-copy">
          <h2>{project.title || 'Untitled project'}</h2>
          <p>{project.category || 'No category'} · {project.year}</p>
          <span className={`ms-project-status ${project.status}`}>{project.status === 'published' ? 'Published' : 'Draft'}</span>
        </div>
        <div className="ms-project-actions">
          <button className="ms-ib" type="button" aria-label={`Move ${project.title} up`} disabled={index === 0 || Boolean(busy)} onClick={() => void move(index, -1)}>↑</button>
          <button className="ms-ib" type="button" aria-label={`Move ${project.title} down`} disabled={index === visible.length - 1 || Boolean(busy)} onClick={() => void move(index, 1)}>↓</button>
          <button className="ms-pill sm" type="button" disabled={busy === project.id} onClick={() => void toggleStatus(project)}>{project.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          <Link className="ms-pill sm solid" href={`/admin/collections/projects/${encodeURIComponent(project.id)}`}>Edit</Link>
          <button className="ms-pill sm danger" type="button" disabled={busy === project.id} onClick={() => void remove(project)}>Delete</button>
        </div>
      </article>)}
      {visible.length === 0 && <p className="ms-projects-empty">{projects.length ? 'No projects match.' : 'No projects yet.'}</p>}
    </div>
  </main>
}
