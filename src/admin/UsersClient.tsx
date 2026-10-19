'use client'

import Link from 'next/link'
import { useState } from 'react'

export type UserRow = {
  id: string
  name: string
  email: string
  initials: string
  status: 'Active' | 'Locked'
  isYou: boolean
}

export default function UsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const remove = async (account: UserRow) => {
    if (account.isYou || !window.confirm(`Remove ${account.email} from admin access?`)) return
    setBusy(account.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(account.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('This user could not be removed.')
      setUsers((current) => current.filter((item) => item.id !== account.id))
      setFeedback(`${account.email} was removed.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'This user could not be removed.')
    } finally {
      setBusy(null)
    }
  }

  return <section className="ms-users" aria-labelledby="ms-users-title">
    <header className="ms-users-heading">
      <div><span className="ms-lbl">Settings</span><h1 className="ms-projects-title" id="ms-users-title">Users</h1><p className="ms-sub">People who can sign in to this admin.</p></div>
      <Link className="ms-pill solid" href="/admin/collections/users/create">+ Add user</Link>
    </header>
    <p className="ms-users-note">Every account currently has admin access. Roles are not configured for this project.</p>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    <div className="ms-users-list" aria-label="Admin users">
      {users.map((account) => <article className="ms-user-row" key={account.id}>
        <span className="ms-user-avatar" aria-hidden="true">{account.initials}</span>
        <div className="ms-user-copy"><strong>{account.name}</strong><span>{account.email}</span></div>
        <span className="ms-user-chip">Admin</span>
        <span className={`ms-user-chip${account.status === 'Active' ? ' active' : ''}`}>{account.status}</span>
        <div className="ms-user-actions">
          <Link className="ms-pill" href={`/admin/collections/users/${encodeURIComponent(account.id)}`}>Edit</Link>
          {account.isYou ? <span className="ms-user-you">You</span> : <button className="ms-pill danger" type="button" disabled={busy === account.id} onClick={() => void remove(account)}>{busy === account.id ? 'Removing…' : 'Remove'}</button>}
        </div>
      </article>)}
      {users.length === 0 && <p className="ms-projects-empty">No admin users yet.</p>}
    </div>
  </section>
}
