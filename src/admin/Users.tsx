import type { ListViewServerProps } from 'payload'

import type { User } from '../payload-types'
import UsersClient, { type UserRow } from './UsersClient'

const isLocked = (lockUntil?: string | null) => Boolean(lockUntil && Date.parse(lockUntil) > Date.now())

/** Admin user directory; the current schema grants every authenticated account admin access. */
export default async function Users({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1000,
    sort: 'email',
    user,
    overrideAccess: false,
  })

  const rows: UserRow[] = result.docs.map((account) => {
    const userAccount = account as User
    const name = userAccount.name?.trim() || userAccount.email.split('@')[0]
    const locked = isLocked(userAccount.lockUntil)
    return {
      id: String(userAccount.id),
      name,
      email: userAccount.email,
      initials: name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?',
      status: locked ? 'Locked' : 'Active',
      isYou: String(userAccount.id) === String(user.id),
    }
  })

  return <UsersClient initialUsers={rows} />
}
