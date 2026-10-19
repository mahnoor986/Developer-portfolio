import { APIError, type CollectionBeforeDeleteHook } from 'payload'

import { getMediaUsage } from '../lib/mediaUsage'

export const preventDeletingUsedMedia: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const usage = await getMediaUsage(req.payload)
  const references = usage.get(String(id))
  if (references?.length) {
    throw new APIError(`This file is still used by ${references.join(', ')}. Remove those references before deleting it.`, 409)
  }
}
