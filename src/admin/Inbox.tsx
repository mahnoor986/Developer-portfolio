import type { ListViewServerProps } from 'payload'

import InboxClient, { type InboxData, type MessageStatus } from './InboxClient'

const statuses: MessageStatus[] = ['new', 'read', 'replied', 'spam', 'archived']

/** Authenticated real-data inbox, rendered in Payload's normal admin template. */
export default async function Inbox({ payload, user, searchParams }: ListViewServerProps) {
  if (!user) return null

  const auth = { user, overrideAccess: false as const }
  const requestedId = searchParams?.open
  const openId = typeof requestedId === 'string' ? requestedId : undefined
  const [all, ...statusCounts] = await Promise.all([
    payload.count({ collection: 'messages', where: { status: { not_in: ['spam', 'archived'] } }, ...auth }),
    ...statuses.map((status) => payload.count({ collection: 'messages', where: { status: { equals: status } }, ...auth })),
  ])
  const result = await payload.find({
    collection: 'messages',
    where: { status: { not_in: ['spam', 'archived'] } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
    ...auth,
  })

  const docs = [...result.docs]
  let requestedMessage: (typeof result.docs)[number] | null = null
  if (openId && !docs.some((message) => String(message.id) === openId)) {
    try {
      requestedMessage = await payload.findByID({ collection: 'messages', id: openId, ...auth })
      docs.unshift(requestedMessage)
    } catch {
      requestedMessage = null
    }
  } else if (openId) {
    requestedMessage = docs.find((message) => String(message.id) === openId) ?? null
  }

  const data: InboxData = {
    counts: Object.fromEntries([['all', all.totalDocs], ...statuses.map((status, index) => [status, statusCounts[index].totalDocs])]) as Record<'all' | MessageStatus, number>,
    messages: docs.map((message) => ({
      id: String(message.id),
      name: message.name,
      email: message.email,
      projectType: message.projectType || 'General',
      message: message.message,
      status: message.status,
      notes: message.notes || '',
      pageUrl: message.pageUrl || '',
      createdAt: message.createdAt,
    })),
  }

  const initialFilter = requestedMessage?.status === 'spam' || requestedMessage?.status === 'archived' ? requestedMessage.status : undefined
  return <InboxClient initialData={data} initialFilter={initialFilter} initialSelectedId={openId} />
}
