import Link from 'next/link'

import { formatDate, mediaUrl, type PostCardData } from '@/lib/content'

export function PostCard({ post, readLabel, index }: { post: PostCardData; readLabel: string; index: number }) {
  const cover = mediaUrl(post.cover)

  return (
    <article className="post-card" data-tilt="" style={{ '--d': index } as React.CSSProperties}>
      <Link href={`/blog/${post.slug}`}>
        {cover && <span className="post-cover" style={{ backgroundImage: `url("${cover}")` }} aria-hidden="true" />}
        <span className="post-in">
          {post.publishedAt && (
            <time className="post-date" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          <h3>{post.title}</h3>
          {post.excerpt && <p>{post.excerpt}</p>}
          {post.tags && post.tags.length > 0 && (
            <span className="tags">
              {post.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          )}
          <span className="post-read">
            {readLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </span>
      </Link>
    </article>
  )
}
