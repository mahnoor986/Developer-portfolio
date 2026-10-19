import type { ListViewServerProps } from 'payload'

import ProcessStepsClient, { type ProcessStepCard } from './ProcessStepsClient'

/** Authenticated process rows, ordered by Payload's fractional index. */
export default async function ProcessSteps({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({ collection: 'process-steps', limit: 1000, sort: '_order', user, overrideAccess: false })
  const steps: ProcessStepCard[] = result.docs.map((step) => ({
    id: String(step.id),
    title: step.title,
    description: step.description,
    tags: step.tags ?? [],
    order: String(step._order ?? ''),
  }))
  return <ProcessStepsClient initialSteps={steps} />
}
