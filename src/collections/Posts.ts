import {
  BlocksFeature,
  CodeBlock,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig, FieldHook } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { revalidatePost, revalidatePostAfterDelete } from '../hooks/revalidate'

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Fill the slug from the title when it's left empty, and always keep it URL-safe. */
const formatSlug: FieldHook = ({ value, data }) => {
  const source = typeof value === 'string' && value.trim() ? value : data?.title
  return typeof source === 'string' ? slugify(source) : value
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: 'Blog',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
  },
  defaultSort: '-publishedAt',
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { afterChange: [revalidatePost], afterDelete: [revalidatePostAfterDelete] },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
    maxPerDoc: 30,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea', admin: { description: 'One or two sentences for the blog list and SEO.' } },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter((f) => f.key !== 'heading'),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BlocksFeature({
            blocks: [
              CodeBlock({
                defaultLanguage: 'ts',
                languages: {
                  plaintext: 'Plain text',
                  ts: 'TypeScript',
                  tsx: 'TSX',
                  js: 'JavaScript',
                  jsx: 'JSX',
                  css: 'CSS',
                  html: 'HTML',
                  json: 'JSON',
                  bash: 'Bash',
                  python: 'Python',
                  c: 'C',
                  cpp: 'C++',
                  sql: 'SQL',
                },
              }),
            ],
          }),
        ],
      }),
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The address of the post: /blog/your-slug. Filled from the title if left empty.',
      },
      hooks: { beforeValidate: [formatSlug] },
    },
    {
      name: 'publishedAt',
      label: 'Published on',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) =>
            value ?? (siblingData?._status === 'published' ? new Date().toISOString() : value),
        ],
      },
    },
    { name: 'tags', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
  ],
}
