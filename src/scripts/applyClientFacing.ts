/**
 * One-time update: turns a database seeded with the first (legacy) content into the
 * client-facing version. Run with: npx payload run src/scripts/applyClientFacing.ts
 *
 * Safe to re-run. Nothing is deleted: retired projects become drafts (hidden from the site,
 * still in the admin), and contact options from the first version are renamed, not removed.
 * Experience entries are left alone (they are edited in the admin).
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import {
  clientFacingSettings,
  contactOptions,
  processSteps,
  projects,
  renamedContactOptions,
  retiredProjects,
  services,
} from '../seedContent'
import { findBy, log, orderKey, upsertMedia } from '../seedLib'

const noLink = { label: null, url: null }

async function apply() {
  const payload = await getPayload({ config })

  // Projects: update or create in display order; the source-code button goes everywhere.
  for (const [i, p] of projects.entries()) {
    const image = p.image ? await upsertMedia(payload, p.image) : undefined
    const found = await findBy(payload, 'projects', 'title', p.title)
    const data = {
      title: p.title,
      category: p.category,
      year: p.year,
      description: p.description,
      tags: p.tags,
      imagePosition: p.imagePosition,
      ...(p.primaryLink ? { primaryLink: p.primaryLink } : {}),
      secondaryLink: noLink,
      _order: orderKey(i),
      _status: 'published' as const,
    }
    if (found) {
      // Keep an image chosen in the admin; only fill it when missing.
      await payload.update({
        collection: 'projects',
        id: found.id,
        data: { ...data, ...(found.image ? {} : image ? { image } : {}) },
        draft: false,
      })
      log(`project "${p.title}": updated`)
    } else {
      await payload.create({ collection: 'projects', data: { ...data, image }, draft: false })
      log(`project "${p.title}": created`)
    }
  }
  for (const [i, title] of retiredProjects.entries()) {
    const found = await findBy(payload, 'projects', 'title', title)
    if (!found) continue
    await payload.update({
      collection: 'projects',
      id: found.id,
      data: { secondaryLink: noLink, _order: orderKey(projects.length + i), _status: 'draft' },
    })
    log(`project "${title}": hidden (draft)`)
  }

  // Contact options: rename the first version's labels, then set visibility and order.
  for (const [from, to] of Object.entries(renamedContactOptions)) {
    const old = await findBy(payload, 'contact-options', 'label', from)
    if (old && !(await findBy(payload, 'contact-options', 'label', to))) {
      await payload.update({ collection: 'contact-options', id: old.id, data: { label: to } })
      log(`contact option "${from}" → "${to}"`)
    }
  }
  const optionIds: Record<string, number> = {}
  for (const [i, label] of contactOptions.entries()) {
    const found = await findBy(payload, 'contact-options', 'label', label)
    const data = { label, visible: true, _order: orderKey(i) }
    const doc = found
      ? await payload.update({ collection: 'contact-options', id: found.id, data })
      : await payload.create({ collection: 'contact-options', data })
    optionIds[label] = doc.id
    log(`contact option "${label}": ${found ? 'updated' : 'created'}`)
  }

  // Services.
  for (const [i, sv] of services.entries()) {
    const found = await findBy(payload, 'services', 'title', sv.title)
    const data = {
      title: sv.title,
      problem: sv.problem,
      outcome: sv.outcome,
      askOption: optionIds[sv.ask] ?? null,
      _order: orderKey(i),
    }
    if (found) await payload.update({ collection: 'services', id: found.id, data })
    else await payload.create({ collection: 'services', data })
    log(`service "${sv.title}": ${found ? 'updated' : 'created'}`)
  }

  // Process steps: new descriptions, matched by title.
  for (const step of processSteps) {
    const found = await findBy(payload, 'process-steps', 'title', step.title)
    if (!found) continue
    await payload.update({ collection: 'process-steps', id: found.id, data: { description: step.description } })
    log(`process step "${step.title}": updated`)
  }

  // Site settings: only the fields the client-facing version changes.
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { ...clientFacingSettings, _status: 'published' },
    draft: false,
  })
  log('site settings: updated')

  const jobs = await payload.find({ collection: 'experience', sort: '_order', depth: 0, pagination: false })
  log(`experience (unchanged): ${jobs.docs.map((j) => `${j.title} @ ${j.organization ?? ''}`).join(' | ')}`)

  log('done')
}

await apply()
process.exit(0)
