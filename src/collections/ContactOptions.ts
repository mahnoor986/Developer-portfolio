import type { CollectionConfig } from 'payload'

import { authenticated, visibleOrAuthenticated } from '../access'
import { homeHooks } from '../hooks/revalidate'

export const ContactOptions: CollectionConfig = {
  slug: 'contact-options',
  labels: { singular: 'Contact option', plural: 'Contact options' },
  orderable: true,
  admin: {
    group: 'Contact',
    useAsTitle: 'label',
    defaultColumns: ['label', 'visible'],
    description: 'The "What do you need?" choices on the contact form. The first visible one is selected by default.',
    components: {
      views: {
        list: { Component: '@/admin/ContactOptions' },
      },
    },
  },
  access: {
    read: visibleOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { ...homeHooks },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'visible', type: 'checkbox', defaultValue: true },
  ],
}
