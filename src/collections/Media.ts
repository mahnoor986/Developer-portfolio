import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { homeHooks } from '../hooks/revalidate'
import { preventDeletingUsedMedia } from '../hooks/media'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    components: {
      views: {
        list: { Component: '@/admin/Media' },
      },
    },
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { ...homeHooks, beforeDelete: [preventDeletingUsedMedia] },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      admin: {
        description: 'Describe the image for screen readers. Not needed for PDFs.',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
  },
}
