import type { CollectionConfig, Field } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { homeHooks } from '../hooks/revalidate'

const linkGroup = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  admin: { description: 'Leave both empty to hide this button.' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', admin: { width: '35%' } },
        { name: 'url', label: 'URL', type: 'text', admin: { width: '65%' } },
      ],
    },
  ],
})

export const Projects: CollectionConfig = {
  slug: 'projects',
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'year', '_status'],
    description: 'Shown in "Selected work". Use the arrows in the project list to change the order.',
    components: {
      views: {
        list: { Component: '@/admin/Projects' },
      },
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { ...homeHooks },
  versions: {
    // Autosave keeps Live Preview in sync while typing; visitors only see published changes.
    drafts: { autosave: { interval: 500 } },
    maxPerDoc: 30,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'text', required: true, admin: { placeholder: 'e.g. 3D game' } },
        { name: 'year', type: 'text', required: true, admin: { placeholder: '2026' } },
      ],
    },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Press Enter after each tag.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { contains: 'image' } },
        },
        {
          name: 'imagePosition',
          type: 'select',
          defaultValue: 'center',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Top', value: 'center top' },
            { label: 'Bottom', value: 'center bottom' },
            { label: 'Left', value: 'left center' },
            { label: 'Right', value: 'right center' },
          ],
          admin: { description: 'Which part of the image stays visible when it is cropped.' },
        },
      ],
    },
    {
      name: 'caseStudy',
      label: 'Case study (optional)',
      type: 'group',
      admin: {
        description:
          'Tells the story clients care about: their problem → what you built → the result. Shown under the description when the project is opened. Leave empty to hide.',
      },
      fields: [
        { name: 'client', label: 'Client / industry', type: 'text', admin: { placeholder: 'e.g. Real estate' } },
        { name: 'problem', label: 'The problem', type: 'textarea', admin: { rows: 2 } },
        {
          name: 'built',
          label: 'What I built',
          type: 'text',
          hasMany: true,
          admin: { description: 'One point per item. Press Enter after each.' },
        },
        {
          name: 'result',
          label: 'Result',
          type: 'text',
          admin: { placeholder: 'e.g. Launched in 3 weeks', description: 'Only results you can back up.' },
        },
      ],
    },
    linkGroup('primaryLink', 'Main button'),
    linkGroup('secondaryLink', 'Second button'),
  ],
}
