/**
 * Attaches a seed image to an existing project, without touching anything else.
 * Run with: PROJECT="<title>" IMAGE=<key in seedContent images> [POSITION="left center"] npx payload run src/scripts/attachProjectImage.ts
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { images, type ImageKey, type ProjectSeed } from '../seedContent'
import { findBy, log, upsertMedia } from '../seedLib'

const title = process.env.PROJECT ?? ''
const key = process.env.IMAGE as ImageKey
if (!title || !(key in images)) throw new Error('Set PROJECT and IMAGE (a key of images in seedContent.ts).')

const payload = await getPayload({ config })
const project = await findBy(payload, 'projects', 'title', title)
if (!project) throw new Error(`No project titled "${title}".`)
const image = await upsertMedia(payload, key)
const position = process.env.POSITION as ProjectSeed['imagePosition'] | undefined
await payload.update({
  collection: 'projects',
  id: project.id,
  data: { image, ...(position ? { imagePosition: position } : {}) },
  draft: false,
})
log(`project "${title}": image set to ${images[key].file}`)
process.exit(0)
