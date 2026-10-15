import type { Metadata } from 'next'

import { About } from '@/components/About'
import { Backdrop, Pointer } from '@/components/Ambient'
import { Contact } from '@/components/Contact'
import { Effects } from '@/components/Effects'
import { Footer } from '@/components/Footer'
import { Header, MobileMenu } from '@/components/Header'
import { Hero, Marquee } from '@/components/Hero'
import { Loader } from '@/components/Loader'
import { Experience, Process } from '@/components/Process'
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
  const { settings: s, projects, skills, steps, experience, contactOptions } = await getHomeContent()

  return (
    <>
      <Backdrop />
      <Loader label={s.loaderLabel ?? ''} />
      <Pointer />

      <Header s={s} />
      <MobileMenu s={s} />

      <main id="home">
        <Hero s={s} />
        <Marquee s={s} />
        <About s={s} />
        <Work s={s} projects={projects} />
        <Toolkit s={s} skills={skills} />
        <Process s={s} steps={steps} />
        <Experience s={s} jobs={experience} />
        <Contact s={s} options={contactOptions} />
      </main>

      <Footer s={s} />
      <div className="vibe-toast" id="vibeToast" role="status" aria-live="polite" />

      <Effects
        config={{
          name: s.name,
          labels: {
            gravityOn: s.gravityOn ?? '',
            gravityOnHint: s.gravityOnHint ?? '',
            gravityOff: s.gravityOff ?? '',
            gravityOffHint: s.gravityOffHint ?? '',
            cursorOpen: s.cursorOpen ?? '',
            cursorDrag: s.cursorDrag ?? '',
            cursorThrow: s.cursorThrow ?? '',
            vibeToast: s.vibeToast ?? '',
            formError: s.errorMessage ?? '',
            formSuccess: s.successMessage ?? '',
            copyEmail: s.copyEmailLabel ?? '',
            copied: s.copiedLabel ?? '',
          },
        }}
      />
    </>
  )
}
