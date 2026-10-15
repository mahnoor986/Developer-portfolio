import Link from 'next/link'

import type { PostCardData, Settings } from '@/lib/content'

import { SplitHeading } from '../SplitHeading'
import { PostCard } from './PostCard'

/** "Latest posts" strip on the home page; renders nothing until a post is published. */
export function LatestPosts({ s, posts }: { s: Settings; posts: PostCardData[] }) {
  if (!posts.length) return null

  return (
    <section className="section wrap blog-strip" id="blog" style={{ paddingTop: 0 }}>
      <div className="work-head">
        <div>
          {s.blogKicker && <p className="kicker">{s.blogKicker}</p>}
          <SplitHeading className="h2" value={s.blogHeading} />
        </div>
        {s.blogIntro && <p>{s.blogIntro}</p>}
      </div>
      <div className="post-grid">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} readLabel={s.blogReadLabel ?? ''} />
        ))}
      </div>
      <div className="blog-more">
        <Link className="pill ghost" href="/blog" data-magnetic="">
          {s.blogAllLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
