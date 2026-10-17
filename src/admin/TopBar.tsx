'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { ADMIN_VIBE_KEY, isVibe, VIBES, type Vibe } from './vibe'

type Result = { kind: string; label: string; sub: string; href: string }

const A = '/admin'

/** Query one collection through the REST API (cookie auth, so access rules apply). */
async function find(collection: string, fields: string[], q: string, signal: AbortSignal) {
  const params = new URLSearchParams({ limit: '4', depth: '0' })
  fields.forEach((f, i) => params.set(`where[or][${i}][${f}][like]`, q))
  const res = await fetch(`/api/${collection}?${params}`, { credentials: 'include', signal })
  if (!res.ok) return []
  return ((await res.json()).docs ?? []) as Record<string, unknown>[]
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const oneLine = (v: unknown, n = 80) => str(v).replace(/\s+/g, ' ').slice(0, n)
const catLabel: Record<string, string> = { fe: 'Frontend', be: 'Backend', tl: 'Tools' }

async function searchAll(q: string, signal: AbortSignal): Promise<Result[]> {
  const [messages, projects, posts, skills, media] = await Promise.all([
    find('messages', ['name', 'email', 'message'], q, signal),
    find('projects', ['title', 'category'], q, signal),
    find('posts', ['title', 'excerpt'], q, signal),
    find('skills', ['name', 'blurb'], q, signal),
    find('media', ['filename', 'alt'], q, signal),
  ])
  return [
    ...messages.map((m) => ({
      kind: 'Message',
      label: str(m.name),
      sub: oneLine(m.message),
      href: `${A}/collections/messages?open=${m.id}`,
    })),
    ...projects.map((p) => ({
      kind: 'Project',
      label: str(p.title),
      sub: [str(p.category), str(p.year)].filter(Boolean).join(' · '),
      href: `${A}/collections/projects/${p.id}`,
    })),
    ...posts.map((p) => ({
      kind: 'Post',
      label: str(p.title) || 'Untitled post',
      sub: oneLine(p.excerpt) || (p._status === 'published' ? 'Published' : 'Draft'),
      href: `${A}/collections/posts/${p.id}`,
    })),
    ...skills.map((s) => ({
      kind: 'Skill',
      label: str(s.name),
      sub: [catLabel[str(s.category)], str(s.blurb)].filter(Boolean).join(' · '),
      href: `${A}/collections/skills?q=${encodeURIComponent(str(s.name))}`,
    })),
    ...media.map((m) => ({
      kind: 'Media',
      label: str(m.filename),
      sub: str(m.alt) || str(m.mimeType),
      href: `${A}/collections/media?q=${encodeURIComponent(str(m.filename))}`,
    })),
  ]
}

function Search() {
  const [q, setQ] = useState('')
  const [response, setResponse] = useState<{ query: string; results: Result[] } | null>(null)
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) return
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      searchAll(term, ctrl.signal)
        .then((results) => setResponse({ query: term, results }))
        .catch(() => {})
    }, 200)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const results = response?.query === q.trim() ? response.results : null
  const show = open && q.trim().length >= 2 && results !== null

  return (
    <div className="ms-search" role="search" ref={box} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        aria-label="Search messages, projects, posts, skills and media"
        placeholder="Search messages, projects, posts, skills…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />
      {show && (
        <div className="ms-results">
          {results.length === 0 && (
            <p className="ms-hint" style={{ padding: 14 }}>
              Nothing matches “{q.trim()}”.
            </p>
          )}
          {results.map((r) => (
            <Link key={r.kind + r.href} className="ms-res" href={r.href} onClick={() => setOpen(false)} prefetch={false}>
              <span className="ms-kind">{r.kind}</span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span className="ms-ell" style={{ fontWeight: 600 }}>
                  {r.label}
                </span>
                <span className="ms-ell" style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {r.sub}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function VibeSwitcher() {
  const vibe = useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-vibe'] })
      return () => observer.disconnect()
    },
    () => {
      const v = document.documentElement.getAttribute('data-vibe')
      return isVibe(v) ? v : 'violet'
    },
    () => 'violet',
  )

  const pick = (v: Vibe) => {
    document.documentElement.setAttribute('data-vibe', v)
    try {
      localStorage.setItem(ADMIN_VIBE_KEY, v)
    } catch {
      /* private mode */
    }
  }

  return (
    <div role="group" aria-label="Admin colour vibe" className="ms-vibes">
      <span className="ms-vibes__lbl">Vibe</span>
      {VIBES.map((v) => {
        const on = v.value === vibe
        return (
          <button
            key={v.value}
            className="ms-vibe"
            type="button"
            aria-label={v.label}
            title={v.label}
            aria-pressed={on}
            onClick={() => pick(v.value)}
          >
            <i
              style={{
                display: 'block',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, #fff 0 8%, ${v.sw} 45%, ${v.sw2} 100%)`,
                boxShadow: on ? `0 0 0 3px var(--night), 0 0 0 4.5px ${v.sw}` : undefined,
              }}
            />
          </button>
        )
      })}
    </div>
  )
}

/** admin.components.actions: the top bar (search on the left; vibe and View site on the right). */
export default function TopBar() {
  const {
    config: { serverURL },
  } = useConfig()

  return (
    <div className="ms-topbar">
      <Search />
      <div className="ms-topbar__right">
        <VibeSwitcher />
        <a className="ms-pill" href={serverURL || '/'} target="_blank" rel="noopener">
          View site
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </a>
      </div>
    </div>
  )
}
