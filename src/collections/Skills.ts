import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { homeHooks } from '../hooks/revalidate'

export const skillCategories = [
  { label: 'Frontend', value: 'fe' },
  { label: 'Backend', value: 'be' },
  { label: 'Tools', value: 'tl' },
] as const

export const Skills: CollectionConfig = {
  slug: 'skills',
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'blurb'],
    description: 'Shown in "My toolkit" and on the skill sphere. Drag rows to change the order.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { ...homeHooks },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [...skillCategories],
        },
      ],
    },
    { name: 'blurb', type: 'text', admin: { placeholder: 'e.g. Components, hooks, state' } },
  ],
}
