import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { homeHooks } from '../hooks/revalidate'

export const ProcessSteps: CollectionConfig = {
  slug: 'process-steps',
  labels: { singular: 'Process step', plural: 'Process steps' },
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'description'],
    description: 'The cards in "How I build". Numbers (01, Step 1 of 5) follow the order here.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { ...homeHooks },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'tags', type: 'text', hasMany: true },
  ],
}
