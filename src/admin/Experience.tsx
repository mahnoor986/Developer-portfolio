import type { ListViewServerProps } from 'payload'

import ExperienceClient, { type ExperienceCard } from './ExperienceClient'

/** Authenticated experience timeline, ordered by Payload's fractional index. */
export default async function Experience({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({ collection: 'experience', limit: 1000, sort: '_order', user, overrideAccess: false })
  const entries: ExperienceCard[] = result.docs.map((entry) => ({
    id: String(entry.id),
    period: entry.period,
    title: entry.title,
    organization: entry.organization ?? '',
    description: entry.description ?? '',
    order: String(entry._order ?? ''),
  }))
  return <ExperienceClient initialEntries={entries} />
}
