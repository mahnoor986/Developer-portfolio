/**
 * Fills an empty Payload database with the site's starting content (src/seedContent.ts).
 * Run with: npx payload run src/seed.ts
 *
 * Safe to re-run: documents that already exist (matched by title/name/label/filename)
 * are skipped, and Site settings are only filled when they are still empty.
 * To move an existing database to the client-facing content, use src/scripts/applyClientFacing.ts.
 */
import { getPayload } from 'payload'

import config from './payload.config'
import {
  clientFacingSettings,
  contactOptions,
  experience,
  images,
  processSteps,
  projects,
  services,
  siteSettingsBase,
  skills,
} from './seedContent'
import { findBy, log, orderKey, upsertMedia } from './seedLib'

async function seed() {
  const payload = await getPayload({ config })

  // Projects (in display order)
  for (const [i, p] of projects.entries()) {
    if (await findBy(payload, 'projects', 'title', p.title)) {
      log(`project "${p.title}": exists, skipped`)
      continue
    }
    await payload.create({
      collection: 'projects',
      data: {
        title: p.title,
        category: p.category,
        year: p.year,
        description: p.description,
        tags: p.tags,
        image: p.image ? await upsertMedia(payload, p.image) : undefined,
        imagePosition: p.imagePosition,
        primaryLink: p.primaryLink,
        _order: orderKey(i),
        _status: 'published',
      },
      draft: false,
    })
    log(`project "${p.title}": created`)
  }

  // Skills
  let skillsCreated = 0
  for (const [name, category, blurb] of skills) {
    if (await findBy(payload, 'skills', 'name', name)) continue
    await payload.create({ collection: 'skills', data: { name, category, blurb } })
    skillsCreated++
  }
  log(`skills: ${skillsCreated} created, ${skills.length - skillsCreated} skipped`)

  // Process steps
  for (const step of processSteps) {
    if (await findBy(payload, 'process-steps', 'title', step.title)) {
      log(`process step "${step.title}": exists, skipped`)
      continue
    }
    await payload.create({ collection: 'process-steps', data: step })
    log(`process step "${step.title}": created`)
  }

  // Experience
  for (const job of experience) {
    if (await findBy(payload, 'experience', 'title', job.title)) {
      log(`experience "${job.title}": exists, skipped`)
      continue
    }
    await payload.create({ collection: 'experience', data: job })
    log(`experience "${job.title}": created`)
  }

  // Contact options
  const optionIds: Record<string, number> = {}
  for (const [i, label] of contactOptions.entries()) {
    const found = await findBy(payload, 'contact-options', 'label', label)
    if (found) {
      optionIds[label] = found.id
      log(`contact option "${label}": exists, skipped`)
      continue
    }
    const doc = await payload.create({
      collection: 'contact-options',
      data: { label, visible: true, _order: orderKey(i) },
    })
    optionIds[label] = doc.id
    log(`contact option "${label}": created`)
  }

  // Services (linked to the contact option their "Ask about this" link selects)
  for (const [i, sv] of services.entries()) {
    if (await findBy(payload, 'services', 'title', sv.title)) {
      log(`service "${sv.title}": exists, skipped`)
      continue
    }
    await payload.create({
      collection: 'services',
      data: {
        title: sv.title,
        problem: sv.problem,
        outcome: sv.outcome,
        askOption: optionIds[sv.ask] ?? null,
        _order: orderKey(i),
      },
    })
    log(`service "${sv.title}": created`)
  }

  // Site settings: only filled once, so edits made in the admin are never overwritten.
  const current = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (current.metaTitle) {
    log('site settings: already filled, skipped')
  } else {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        ...siteSettingsBase,
        ...clientFacingSettings,
        photo: await upsertMedia(payload, 'avatar'),
        photoAlt: images.avatar.alt,
        _status: 'published',
      },
      draft: false,
    })
    log('site settings: filled')
  }

  log('done')
}

await seed()
process.exit(0)
