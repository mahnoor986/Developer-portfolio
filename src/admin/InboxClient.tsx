'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showUndoableDelete } from './toasts'

export type MessageStatus = 'new' | 'read' | 'replied' | 'spam' | 'archived'
export type InboxFilter = 'all' | MessageStatus

export type InboxMessage = {
  id: string
  name: string
  email: string
  projectType: string
  message: string
  status: MessageStatus
  notes: string
  pageUrl: string
  createdAt: string
}

export type InboxData = {
  counts: Record<InboxFilter, number>
  messages: InboxMessage[]
}

const filters: { value: InboxFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'spam', label: 'Spam' },
  { value: 'archived', label: 'Archived' },
]

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const patchMessage = async (id: string, body: Partial<Pick<InboxMessage, 'status' | 'notes'>>) => {
  try {
    const response = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return response.ok
  } catch {
    return false
  }
}

const receivedDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 6 8 7 8-7" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </svg>
  )
}

export default function InboxClient({ initialData, initialFilter, initialSelectedId }: { initialData: InboxData; initialFilter?: InboxFilter; initialSelectedId?: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialData.messages)
  const [counts, setCounts] = useState(initialData.counts)
  const [filter, setFilter] = useState<InboxFilter>(initialFilter ?? 'all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? initialData.messages[0]?.id ?? null)
  const readInFlight = useRef(new Set<string>())
  const lastQueryKey = useRef('all:')
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({})
  const [notesState, setNotesState] = useState('All changes saved')
  const [error, setError] = useState('')
  const selected = messages.find((message) => message.id === selectedId) ?? messages[0] ?? null
  const visibleMessages = messages.filter((message) => filter === 'all' ? !['spam', 'archived'].includes(message.status) : message.status === filter)
  const noteValue = selected ? notesDrafts[selected.id] ?? selected.notes : ''

  useEffect(() => {
    if (!selected || selected.status !== 'new' || readInFlight.current.has(selected.id)) return
    readInFlight.current.add(selected.id)
    void patchMessage(selected.id, { status: 'read' }).then((ok) => {
      readInFlight.current.delete(selected.id)
      if (!ok) {
        setError('This message could not be marked as read.')
        return
      }
      setMessages((current) => current.map((message) => message.id === selected.id ? { ...message, status: 'read' } : message))
      setCounts((current) => ({ ...current, new: Math.max(0, current.new - 1), read: current.read + 1 }))
    })
  }, [selected])

  useEffect(() => {
    if (!selected || noteValue === selected.notes) return
    const timer = window.setTimeout(() => {
      setNotesState('Saving notes…')
      void patchMessage(selected.id, { notes: noteValue }).then((ok) => {
        if (!ok) {
          setNotesState('Could not save notes')
          return
        }
        setMessages((current) => current.map((message) => message.id === selected.id ? { ...message, notes: noteValue } : message))
        setNotesState('All changes saved')
      })
    }, 550)
    return () => window.clearTimeout(timer)
  }, [noteValue, selected])

  useEffect(() => {
    const term = query.trim()
    const queryKey = `${filter}:${term}`
    if (lastQueryKey.current === queryKey) return
    lastQueryKey.current = queryKey
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ limit: '50', depth: '0', sort: '-createdAt' })
      if (filter === 'all') {
        params.set('where[status][not_in][0]', 'spam')
        params.set('where[status][not_in][1]', 'archived')
      } else {
        params.set('where[status][equals]', filter)
      }
      if (term) {
        ;['name', 'email', 'message'].forEach((field, index) => params.set(`where[or][${index}][${field}][like]`, term))
      }
      void fetch(`/api/messages?${params}`, { credentials: 'include', signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Messages could not be loaded.')
          const data = await response.json() as { docs: InboxMessage[] }
          const rows = data.docs.map((message) => ({ ...message, notes: message.notes ?? '' }))
          setMessages(rows)
          setSelectedId((current) => rows.some((message) => message.id === current) ? current : rows[0]?.id ?? null)
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === 'AbortError') return
          setError('Messages could not be loaded. Please try again.')
        })
    }, 180)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [filter, query])

  const updateStatus = async (message: InboxMessage, status: MessageStatus) => {
    setError('')
    if (message.status === status) return
    const ok = await patchMessage(message.id, { status })
    if (!ok) {
      setError('The message status could not be saved. Please try again.')
      return
    }
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, status } : item))
    setCounts((current) => ({
      ...current,
      [message.status]: Math.max(0, current[message.status] - 1),
      [status]: current[status] + 1,
      all: ['spam', 'archived'].includes(message.status) ? current.all + 1 : ['spam', 'archived'].includes(status) ? Math.max(0, current.all - 1) : current.all,
    }))
  }

  const selectMessage = (message: InboxMessage) => {
    if (selected && noteValue !== selected.notes) void patchMessage(selected.id, { notes: noteValue })
    setNotesState('All changes saved')
    setSelectedId(message.id)
  }

  const removeMessage = async () => {
    if (!selected || !window.confirm(`Delete the message from ${selected.name}? You can undo this for five seconds.`)) return
    const message = selected
    const index = messages.findIndex((item) => item.id === message.id)
    const removedStatus = message.status
    showUndoableDelete({
      label: `Message from ${message.name}`,
      remove: () => {
        setMessages((current) => current.filter((item) => item.id !== message.id))
        setCounts((current) => ({
          ...current,
          [removedStatus]: Math.max(0, current[removedStatus] - 1),
          all: ['spam', 'archived'].includes(removedStatus) ? current.all : Math.max(0, current.all - 1),
        }))
        setSelectedId(null)
      },
      undo: () => {
        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) return current
          const next = [...current]
          next.splice(Math.min(index, next.length), 0, message)
          return next
        })
        setCounts((current) => ({
          ...current,
          [removedStatus]: current[removedStatus] + 1,
          all: ['spam', 'archived'].includes(removedStatus) ? current.all : current.all + 1,
        }))
        setSelectedId(message.id)
      },
      commit: async () => {
        const response = await fetch(`/api/messages/${encodeURIComponent(message.id)}`, { method: 'DELETE', credentials: 'include' })
        if (!response.ok) throw new Error('The message could not be deleted. Please try again.')
        router.refresh()
      },
    })
  }

  const replyHref = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent(`Re: your ${selected.projectType.toLowerCase()} enquiry`)}`
    : '#'

  return (
    <div className="ms-inbox">
      <header className="ms-inbox-heading">
        <div className="ms-inbox-title">
          <span className="ms-crumb">Inbox</span>
          <h1 className="ms-h1">Messages</h1>
        </div>
        <label className="ms-search ms-inbox-search">
          <SearchIcon />
          <input type="search" aria-label="Search the inbox" placeholder="Search name, email or text" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </header>

      <div className="ms-tabs ms-inbox-filters" role="group" aria-label="Filter messages by status">
        {filters.map((item) => (
          <button className={filter === item.value ? 'ms-pill on' : 'ms-pill'} type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}<span className="n">{counts[item.value]}</span>
          </button>
        ))}
      </div>
      {error && <p className="ms-inbox-error" role="alert">{error}</p>}

      <section className="ms-inbox-layout" aria-label="Message inbox">
        <div className="ms-card ms-inbox-list-card">
          {visibleMessages.length === 0 ? (
            <p className="ms-hint ms-inbox-empty">{query ? 'No messages match your search.' : 'No messages in this view.'}</p>
          ) : visibleMessages.map((message) => (
            <button className={selected?.id === message.id ? 'ms-msg on' : 'ms-msg'} type="button" key={message.id} aria-pressed={selected?.id === message.id} onClick={() => selectMessage(message)}>
              <span className="ms-inbox-row-top">
                <span className={message.status === 'new' ? 'ms-b ms-ell' : 'ms-ell'}>{message.name}</span>
                <span className="ms-muted-small">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(message.createdAt))}</span>
              </span>
              <span className="ms-inbox-row-tags"><span className="ms-chip type">{message.projectType}</span><span className={`ms-chip ${message.status}`}>{cap(message.status)}</span></span>
              <span className="ms-sub ms-clamp2">{message.message.replace(/\s+/g, ' ').trim()}</span>
            </button>
          ))}
        </div>

        {selected ? (
          <article className="ms-card ms-inbox-reading" aria-label={`Message from ${selected.name}`}>
            <div className="ms-inbox-person-head">
              <div className="ms-inbox-person-copy">
                <h2 className="ms-h2 ms-inbox-sender">{selected.name}</h2>
                <a className="ms-inbox-email" href={`mailto:${selected.email}`}>{selected.email}</a>
              </div>
              <div className="ms-inbox-actions">
                <a className="ms-pill solid" href={replyHref} onClick={() => void updateStatus(selected, 'replied')}><MailIcon />Reply by email</a>
                <button className="ms-pill danger" type="button" onClick={() => void removeMessage()}>Delete</button>
              </div>
            </div>

            <div className="ms-inbox-info">
              <div><span className="ms-lbl">Needs</span><span>{selected.projectType}</span></div>
              <div><span className="ms-lbl">Received</span><span>{receivedDate(selected.createdAt)}</span></div>
              <div><span className="ms-lbl">From</span><a className="ms-inbox-email" href={`mailto:${selected.email}`}>{selected.email}</a></div>
            </div>

            <div className="ms-inbox-message-body"><p>{selected.message}</p></div>

            <div className="ms-inbox-status-block">
              <span className="ms-lbl" id="inbox-status-label">Status</span>
              <div className="ms-tabs" role="group" aria-labelledby="inbox-status-label">
                {(['new', 'read', 'replied', 'spam', 'archived'] as MessageStatus[]).map((status) => (
                  <button className={selected.status === status ? 'ms-pill sm on' : 'ms-pill sm'} type="button" key={status} aria-pressed={selected.status === status} onClick={() => void updateStatus(selected, status)}>{cap(status)}</button>
                ))}
              </div>
            </div>

            <label className="ms-inbox-notes-label" htmlFor="inbox-private-notes">Private notes · only you see these</label>
            <textarea
              className="ms-inp ms-inbox-notes"
              id="inbox-private-notes"
              placeholder="e.g. Sent a quote on Friday, follow up next week"
              value={noteValue}
              onChange={(event) => {
                setNotesDrafts((current) => ({ ...current, [selected.id]: event.target.value }))
                setNotesState('Unsaved changes')
              }}
            />
            <span className="ms-inbox-save-state" aria-live="polite">{notesState}</span>
            {selected.pageUrl && <a className="ms-inbox-source" href={selected.pageUrl} target="_blank" rel="noreferrer">Sent from page <span>{selected.pageUrl}</span></a>}
          </article>
        ) : (
          <div className="ms-card ms-inbox-no-selection"><span className="ms-inbox-empty-mark"><SearchIcon /></span><h2 className="ms-h2">Select a message</h2><p className="ms-sub">Choose a message from the list to read it.</p></div>
        )}
      </section>
    </div>
  )
}
