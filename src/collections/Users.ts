import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Admin',
    useAsTitle: 'email',
    components: {
      views: {
        list: { Component: '@/admin/Users' },
      },
    },
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
  ],
}
