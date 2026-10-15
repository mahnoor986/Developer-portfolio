import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostBody } from '@/components/blog/PostBody'
import { SiteShell } from '@/components/SiteShell'
import { formatDate, getPost, getPosts, getPublishedSlugs, getSiteSettings, mediaUrl } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [s, post] = await Promise.all([getSiteSettings(), getPost(slug)])
  if (!post) return { title: s.metaTitle }
  const cover = mediaUrl(post.cover)
  return {
    title: `${post.title} · ${s.fullName}`,
    description: post.excerpt || s.metaDescription,
    metadataBase: process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : undefined,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [s, post, posts] = await Promise.all([getSiteSettings(), getPost(slug), getPosts(1)])
  if (!post) notFound()

  const cover = typeof post.cover === 'object' ? post.cover : null

  return (
    <SiteShell s={s} onHome={false} hasPosts={posts.length > 0}>
      <article className="section wrap post">
        <div className="post-wrap">
          <Link className="pill ghost small post-back" href="/blog">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m11 18-6-6 6-6" />
            </svg>
            {s.blogBackLabel}
          </Link>
          <header className="post-head">
            {post.publishedAt && (
              <time className="kicker" dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            <h1 className="h2 post-title">{post.title}</h1>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            {post.tags && post.tags.length > 0 && (
              <div className="tags">
                {post.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </header>
          {cover?.url && (
            <figure className="post-cover-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- Payload/Blob URL, sized by CSS */}
              <img src={cover.url} alt={cover.alt ?? ''} width={cover.width ?? undefined} height={cover.height ?? undefined} />
            </figure>
          )}
          <PostBody data={post.content} />
        </div>
      </article>
    </SiteShell>
  )
}
