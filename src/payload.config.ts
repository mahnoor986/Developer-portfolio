import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { ContactOptions } from './collections/ContactOptions'
import { Experience } from './collections/Experience'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Posts } from './collections/Posts'
import { ProcessSteps } from './collections/ProcessSteps'
import { Projects } from './collections/Projects'
import { Skills } from './collections/Skills'
import { Users } from './collections/Users'
import { EmailSettings } from './globals/EmailSettings'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Projects,
    Skills,
    ProcessSteps,
    Experience,
    Posts,
    Media,
    Messages,
    ContactOptions,
    Users,
  ],
  globals: [SiteSettings, EmailSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Without a key (local dev), Payload just prints emails to the server console instead of sending them.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Mahnoor Portfolio',
      })
    : undefined,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // Uploads go to Vercel Blob when a token is set (production); local dev falls back to the filesystem.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
