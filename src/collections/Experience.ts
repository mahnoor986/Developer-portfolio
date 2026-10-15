import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'

export const Experience: CollectionConfig = {
  slug: 'experience',
  labels: { singular: 'Experience', plural: 'Experience' },
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'organization', 'period'],
    description: 'The timeline in "My experience". Drag rows to change the order.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { placeholder: 'Intern Developer' } },
        { name: 'period', type: 'text', required: true, admin: { placeholder: 'Aug 2026 to now' } },
      ],
    },
    { name: 'organization', type: 'text', admin: { placeholder: 'KhairFlow, Karachi' } },
    { name: 'description', type: 'textarea' },
  ],
}
