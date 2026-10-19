import type { ListViewServerProps } from 'payload'

import ContactOptionsClient, { type ContactOptionCard } from './ContactOptionsClient'

/** Authenticated contact options and their public form preview. */
export default async function ContactOptions({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({ collection: 'contact-options', limit: 1000, sort: '_order', user, overrideAccess: false })
  const options: ContactOptionCard[] = result.docs.map((option) => ({
    id: String(option.id),
    label: option.label,
    visible: Boolean(option.visible),
    order: String(option._order ?? ''),
  }))
  return <ContactOptionsClient initialOptions={options} />
}
