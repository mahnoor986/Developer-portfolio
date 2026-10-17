'use client'

import Link from 'next/link'
import { useState } from 'react'

export type DashboardData = {
  name: string
  greeting: string
  newMessages: number
  available: boolean
  availabilityText: string
  defaultVibe: string
  visibleOptions: number
  autoReply: boolean
  cvUploaded: boolean
  projects: number
  publishedProjects: number
  draftProjects: number
  posts: number
  publishedPosts: number
  draftPosts: number
  skills: number
  latestSender: string
  latestType: string
  latest: { id: string; name: string; when: string; type: string; preview: string; status: string }[]
}

const admin = '/admin'

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 17 10-10M8 7h9v9" />
    </svg>
  )
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [available, setAvailable] = useState(data.available)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleAvailable = async () => {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/globals/site-settings?depth=1', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !available }),
      })
      if (!response.ok) throw new Error('The availability setting could not be saved.')
      setAvailable((value) => !value)
    } catch {
      setError('Could not save availability. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const latestLabel = data.latestSender
    ? `Latest: ${data.latestSender}${data.latestType ? ` · ${data.latestType}` : ''}`
    : 'All caught up'

  return (
    <div className="ms-dashboard">
      <section className="ms-dash-heading">
        <div className="ms-dash-intro">
          <span className="ms-crumb">Dashboard</span>
          <h1 className="ms-dash-greeting">
            {data.greeting}, <span>{data.name}</span>
          </h1>
          <p className="ms-sub ms-dash-subline">
            {data.newMessages
              ? `You have ${data.newMessages} new message${data.newMessages === 1 ? '' : 's'} waiting.`
              : 'Inbox zero. Nice work.'}
          </p>
        </div>
        <button
          className="ms-availability"
          type="button"
          aria-label="Show available status"
          aria-pressed={available}
          onClick={toggleAvailable}
          disabled={saving}
        >
          <span className={available ? 'ms-dot' : 'ms-dot off'} />
          <span>{available ? data.availabilityText : 'Not taking new projects'}</span>
          <span className={available ? 'ms-sw on' : 'ms-sw'} aria-hidden="true"><span /></span>
        </button>
      </section>
      {error && <p role="alert" className="ms-dash-error">{error}</p>}

      <section className="ms-g3 ms-dashboard-stats" aria-label="At a glance">
        <Link className={data.newMessages ? 'ms-stat hot' : 'ms-stat'} href={`${admin}/collections/messages`}>
          <span className="ms-lbl ms-accent">New messages</span>
          <span className="ms-big">{data.newMessages}</span>
          <span className="ms-sub ms-stat-sub">{latestLabel}</span>
        </Link>
        <Link className="ms-stat" href={`${admin}/collections/projects`}>
          <span className="ms-lbl">Projects</span>
          <span className="ms-big">{data.projects}</span>
          <span className="ms-sub ms-stat-sub">{data.publishedProjects} published · {data.draftProjects} drafts</span>
        </Link>
        <Link className="ms-stat" href={`${admin}/collections/posts`}>
          <span className="ms-lbl">Blog posts</span>
          <span className="ms-big">{data.posts}</span>
          <span className="ms-sub ms-stat-sub">
            {data.posts ? `${data.publishedPosts} published · ${data.draftPosts} drafts` : 'Write your first post'}
          </span>
        </Link>
        <Link className="ms-stat" href={`${admin}/collections/skills`}>
          <span className="ms-lbl">Skills</span>
          <span className="ms-big">{data.skills}</span>
          <span className="ms-sub ms-stat-sub">Frontend, Backend and Tools</span>
        </Link>
      </section>

      <section className="ms-dashboard-lower" aria-label="Recent activity and shortcuts">
        <div className="ms-card ms-latest-card">
          <div className="ms-latest-head">
            <h2 className="ms-h2">Latest messages</h2>
            <Link className="ms-pill sm" href={`${admin}/collections/messages`}>Open inbox</Link>
          </div>
          <div className="ms-latest-scroll">
            <div className="ms-latest-list">
              {data.latest.length === 0 ? (
                <p className="ms-hint ms-empty-messages">No messages yet.</p>
              ) : data.latest.map((message) => (
                <Link className="ms-mrow" href={`${admin}/collections/messages?open=${encodeURIComponent(message.id)}`} key={message.id}>
                  <span className="ms-message-person">
                    <span className={message.status === 'new' ? 'ms-b ms-ell' : 'ms-ell'}>{message.name}</span>
                    <span className="ms-muted-small">{message.when}</span>
                  </span>
                  <span className="ms-message-preview">
                    <span className="ms-chip type">{message.type}</span>
                    <span className="ms-sub ms-ell">{message.preview}</span>
                  </span>
                  <span className={`ms-chip ${message.status}`}>{message.status[0]?.toUpperCase()}{message.status.slice(1)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="ms-dashboard-aside">
          <div className="ms-card ms-quick-card">
            <h2 className="ms-h2">Quick actions</h2>
            <div className="ms-dashboard-actions">
              <Link className="ms-pill solid" href={`${admin}/globals/site-settings`}>Edit homepage</Link>
              <Link className="ms-pill" href={`${admin}/collections/projects/create`}>Add project</Link>
              <Link className="ms-pill" href={`${admin}/collections/posts/create`}>New post</Link>
              <Link className="ms-pill" href={`${admin}/globals/site-settings?tab=CV`}>Upload CV</Link>
            </div>
          </div>

          <div className="ms-card ms-glance-card">
            <h2 className="ms-h2">Site at a glance</h2>
            <div className="ms-glance-row"><span className="ms-sub">Default vibe</span><span>{data.defaultVibe}</span></div>
            <div className="ms-glance-row"><span className="ms-sub">Contact options</span><span>{data.visibleOptions} visible</span></div>
            <div className="ms-glance-row">
              <span className="ms-sub">Client auto-reply</span>
              <span className="ms-glance-status"><span className={data.autoReply ? 'ms-dot' : 'ms-dot off'} />{data.autoReply ? 'On' : 'Off'}</span>
            </div>
            <div className="ms-glance-cv">
              <span className="ms-sub">CV</span>
              <Link className="ms-pill sm" href={`${admin}/globals/site-settings?tab=CV`}>
                {data.cvUploaded ? 'Uploaded · View' : 'Not uploaded · Upload'}
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
