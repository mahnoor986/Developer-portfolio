import type { ListViewServerProps } from 'payload'

import PostsClient, { type PostCard } from './PostsClient'

/** Authenticated blog cards, including unpublished drafts. */
export default async function Posts({ payload, user }: ListViewServerProps) {
  if (!user) return null

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: true,
    limit: 1000,
    sort: '-publishedAt',
    user,
    overrideAccess: false,
  })

  const posts: PostCard[] = result.docs.map((post) => {
    const cover = post.cover && typeof post.cover === 'object' ? post.cover : null
    return {
      id: String(post.id),
      title: post.title,
      excerpt: post.excerpt ?? '',
      status: post._status === 'published' ? 'published' : 'draft',
      publishedAt: post.publishedAt ?? null,
      coverUrl: cover?.url ?? null,
      coverAlt: cover?.alt ?? '',
    }
  })
  return <PostsClient initialPosts={posts} />
}
