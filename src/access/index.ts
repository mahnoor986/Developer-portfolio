import type { Access, FieldAccess } from 'payload'

/** Anyone, logged in or not. */
export const anyone: Access = () => true

/** Only logged-in admins. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const authenticatedField: FieldAccess = ({ req: { user } }) => Boolean(user)

/** Never allowed through the API (server code uses `overrideAccess: true`). */
export const nobody: Access = () => false

export const nobodyField: FieldAccess = () => false

/** Admins see everything; the public only sees published documents. */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/** Admins see everything; the public only sees documents marked visible. */
export const visibleOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { visible: { equals: true } }
}
