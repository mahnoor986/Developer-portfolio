import type { Metadata } from 'next'

import { PostCard } from '@/components/blog/PostCard'
import { SiteShell } from '@/components/SiteShell'
import { SplitHeading } from '@/components/SplitHeading'
import { getPosts, getSiteSettings } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title: `${s.menuBlog || 'Blog'} · ${s.fullName}`,
    description: s.blogIntro || s.metaDescription,
  }
}

export default async function BlogPage() {
  const [s, posts] = await Promise.all([getSiteSettings(), getPosts()])

  return (
    <SiteShell s={s} onHome={false} hasPosts={posts.length > 0}>
      <section className="section wrap blog-page">
        <div className="work-head">
          <div>
            {s.blogKicker && <p className="kicker">{s.blogKicker}</p>}
            <SplitHeading className="h2" value={s.blogHeading} />
          </div>
          {s.blogIntro && <p>{s.blogIntro}</p>}
        </div>
        {posts.length > 0 ? (
          <div className="post-grid">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} readLabel={s.blogReadLabel ?? ''} />
            ))}
          </div>
        ) : (
          <p className="blog-empty">{s.blogEmptyText}</p>
        )}
      </section>
    </SiteShell>
  )
}
