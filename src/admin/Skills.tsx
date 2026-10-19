import type { ListViewServerProps } from 'payload'

import SkillsClient, { type SkillCard } from './SkillsClient'

/** Authenticated skill cards, ordered by Payload's fractional index. */
export default async function Skills({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({
    collection: 'skills',
    limit: 1000,
    sort: '_order',
    user,
    overrideAccess: false,
  })

  const skills: SkillCard[] = result.docs.map((skill) => ({
    id: String(skill.id),
    name: skill.name,
    category: skill.category,
    blurb: skill.blurb ?? '',
    order: String(skill._order ?? ''),
  }))

  return <SkillsClient initialSkills={skills} />
}
