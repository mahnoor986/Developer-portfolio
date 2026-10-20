import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Email settings',
  admin: { group: 'Contact' },
  access: {
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'emailSettingsPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/admin/EmailSettingsDesign#EmailSettingsPreview',
        },
      },
    },
    {
      name: 'notifyEmail',
      label: 'Send new-message alerts to',
      type: 'email',
      required: true,
      defaultValue: 'mahnoorrr41@gmail.com',
    },
    {
      name: 'autoReplyEnabled',
      label: 'Send an automatic reply to the sender',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Requires the EmailJS auto-reply template and server environment variables to be configured.',
      },
    },
    {
      name: 'autoReplySubject',
      label: 'Auto-reply subject',
      type: 'text',
      defaultValue: 'Thanks for your message',
      admin: { condition: (data) => Boolean(data?.autoReplyEnabled) },
    },
    {
      name: 'autoReplyBody',
      label: 'Auto-reply text',
      type: 'textarea',
      defaultValue:
        "Hi {name},\n\nThanks for getting in touch! I've received your message and I'll get back to you within a couple of days.\n\nMahnoor",
      admin: {
        rows: 8,
        condition: (data) => Boolean(data?.autoReplyEnabled),
        description: '{name} is replaced by the sender\'s name; the EmailJS template uses this text as its message.',
      },
    },
  ],
}
