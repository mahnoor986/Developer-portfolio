import type { ListViewServerProps } from 'payload'

import ProjectsClient, { type ProjectCard } from './ProjectsClient'

/** Authenticated project cards, ordered by Payload's fractional index. */
export default async function Projects({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({
    collection: 'projects',
    depth: 1,
    draft: true,
    limit: 1000,
    sort: '_order',
    user,
    overrideAccess: false,
  })

  const projects: ProjectCard[] = result.docs.map((project) => {
    const image = project.image && typeof project.image === 'object' ? project.image : null
    return {
      id: String(project.id),
      title: project.title,
      category: project.category,
      year: project.year,
      status: project._status === 'published' ? 'published' : 'draft',
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? '',
      order: String(project._order ?? ''),
    }
  })

  return <ProjectsClient initialProjects={projects} />
}
