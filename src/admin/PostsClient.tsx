'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export type PostCard = {
  id: string
  title: string
  excerpt: string
  status: 'published' | 'draft'
  publishedAt: string | null
  coverUrl: string | null
  coverAlt: string
}
type Filter = 'all' | 'published' | 'draft'
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

async function readPosts(): Promise<PostCard[]> {
  const response = await fetch('/api/posts?depth=1&draft=true&limit=1000&sort=-publishedAt', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh blog posts.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => {
    const cover = doc.cover && typeof doc.cover === 'object' ? doc.cover as Record<string, unknown> : null
    return {
      id: String(doc.id),
      title: String(doc.title ?? ''),
      excerpt: String(doc.excerpt ?? ''),
      status: doc._status === 'published' ? 'published' : 'draft',
      publishedAt: typeof doc.publishedAt === 'string' ? doc.publishedAt : null,
      coverUrl: typeof cover?.url === 'string' ? cover.url : null,
      coverAlt: typeof cover?.alt === 'string' ? cover.alt : '',
    }
  })
}

const dateLabel = (value: string | null) => value
  ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
  : 'Not published'

export default function PostsClient({ initialPosts }: { initialPosts: PostCard[] }) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState<Filter>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const visible = useMemo(() => filter === 'all' ? posts : posts.filter((post) => post.status === filter), [filter, posts])

  const refresh = async () => { setPosts(await readPosts()); router.refresh() }
  const remove = async (post: PostCard) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return
    setBusy(post.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(post.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Post could not be deleted.')
      await refresh()
      setFeedback('Post deleted.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Post could not be deleted.')
    } finally { setBusy(null) }
  }

  const newPost = <Link className="ms-pill solid" href="/admin/collections/posts/create">+ New post</Link>

  return <section className="ms-posts" aria-labelledby="ms-posts-heading">
    <header className="ms-posts-heading">
      <div><span className="ms-lbl">Content</span><h1 className="ms-projects-title" id="ms-posts-heading">Blog posts</h1></div>
      {newPost}
    </header>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    {posts.length === 0 ? <div className="ms-posts-empty">
      <span className="ms-posts-empty-icon" aria-hidden="true">✎</span>
      <h2>No posts yet</h2>
      <p>The Blog link stays hidden on your site until you publish your first post.</p>
      <Link className="ms-pill solid" href="/admin/collections/posts/create">Write your first post</Link>
    </div> : <>
      <div className="ms-posts-filters" role="group" aria-label="Filter posts">
        {filters.map((item) => {
          const count = item.value === 'all' ? posts.length : posts.filter((post) => post.status === item.value).length
          return <button key={item.value} type="button" className={`ms-pill${filter === item.value ? ' on' : ''}`} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}<span className="n">{count}</span>
          </button>
        })}
      </div>
      <div className="ms-posts-list">
        {visible.map((post) => <article className="ms-post-row" key={post.id}>
          <div className="ms-post-thumb" role={post.coverUrl ? 'img' : undefined} aria-label={post.coverUrl ? post.coverAlt || post.title : undefined}>
            {post.coverUrl ? <span style={{ backgroundImage: `url("${post.coverUrl.replaceAll('"', '%22')}")` }} /> : <span>POST</span>}
          </div>
          <div className="ms-post-copy">
            <h2>{post.title || 'Untitled post'}</h2>
            {post.excerpt && <p>{post.excerpt}</p>}
            <div className="ms-post-meta"><span className={`ms-project-status ${post.status}`}>{post.status === 'published' ? 'Published' : 'Draft'}</span><span>{dateLabel(post.publishedAt)}</span></div>
          </div>
          <div className="ms-post-actions">
            <Link className="ms-pill sm solid" href={`/admin/collections/posts/${encodeURIComponent(post.id)}`}>Edit</Link>
            <button className="ms-pill sm danger" type="button" disabled={busy === post.id} onClick={() => void remove(post)}>Delete</button>
          </div>
        </article>)}
        {visible.length === 0 && <p className="ms-projects-empty">No posts match this filter.</p>}
      </div>
    </>}
  </section>
}
