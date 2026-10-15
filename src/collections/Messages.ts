import type { CollectionConfig, Field } from 'payload'

import { authenticated, authenticatedField, nobody, nobodyField } from '../access'
import { emailOnNewMessage } from '../hooks/messageEmails'

/** Fields written once by the contact form and never edited afterwards. */
const fromForm = (field: Field): Field =>
  ({
    ...field,
    access: { create: nobodyField, update: nobodyField, read: authenticatedField },
    admin: { ...('admin' in field ? field.admin : {}), readOnly: true },
  }) as Field

export const messageStatuses = [
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Replied', value: 'replied' },
  { label: 'Spam', value: 'spam' },
  { label: 'Archived', value: 'archived' },
] as const

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    group: 'Contact',
    useAsTitle: 'name',
    defaultColumns: ['status', 'createdAt', 'name', 'projectType'],
    listSearchableFields: ['name', 'email', 'message'],
    description: 'Messages sent through the contact form.',
  },
  defaultSort: '-createdAt',
  access: {
    // Created only by the contact form's Server Action (overrideAccess: true).
    create: nobody,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [emailOnNewMessage],
  },
  fields: [
    fromForm({ name: 'name', type: 'text', required: true }),
    fromForm({ name: 'email', type: 'email', required: true }),
    fromForm({ name: 'projectType', label: 'Project type', type: 'text' }),
    fromForm({ name: 'message', type: 'textarea', required: true }),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [...messageStatuses],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Private notes, never shown to the sender.' },
    },
    fromForm({ name: 'pageUrl', label: 'Sent from', type: 'text', admin: { position: 'sidebar' } }),
    fromForm({
      name: 'ipHash',
      label: 'IP hash',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'Hashed IP, used only for rate limiting.' },
    }),
  ],
}
