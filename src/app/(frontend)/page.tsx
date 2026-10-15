import type { Metadata } from 'next'

import { About } from '@/components/About'
import { LatestPosts } from '@/components/blog/LatestPosts'
import { Contact } from '@/components/Contact'
import { Hero, Marquee } from '@/components/Hero'
import { Experience, Process } from '@/components/Process'
import { SiteShell } from '@/components/SiteShell'
import { Toolkit } from '@/components/Toolkit'
import { Work } from '@/components/Work'
import { getHomeContent } from '@/lib/content'

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getHomeContent()
  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    metadataBase: process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : undefined,
    openGraph: { title: settings.metaTitle, description: settings.metaDescription ?? undefined, type: 'website' },
  }
}

export default async function HomePage() {
  const { settings: s, projects, skills, steps, experience, contactOptions, latestPosts } = await getHomeContent()

  return (
    <SiteShell s={s} onHome hasPosts={latestPosts.length > 0}>
      <Hero s={s} />
      <Marquee s={s} />
      <About s={s} />
      <Work s={s} projects={projects} />
      <LatestPosts s={s} posts={latestPosts} />
      <Toolkit s={s} skills={skills} />
      <Process s={s} steps={steps} />
      <Experience s={s} jobs={experience} />
      <Contact s={s} options={contactOptions} />
    </SiteShell>
  )
}
