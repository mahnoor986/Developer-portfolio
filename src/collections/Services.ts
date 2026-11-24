import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { homeHooks } from '../hooks/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'problem'],
    description: 'The cards in "Services", right after the hero. Drag the rows to change the order.',
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
    {
      name: 'problem',
      label: 'Problem it solves',
      type: 'textarea',
      required: true,
      admin: { description: "The client's situation, in their words." },
    },
    {
      name: 'outcome',
      label: 'What the client gets',
      type: 'textarea',
      required: true,
    },
    {
      name: 'askOption',
      label: 'Contact option',
      type: 'relationship',
      relationTo: 'contact-options',
      admin: {
        description:
          'The "Ask about this" link scrolls to the contact form and selects this option. Leave empty to hide the link.',
      },
    },
  ],
}
