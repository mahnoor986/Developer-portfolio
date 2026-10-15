import { Instrument_Sans, Space_Grotesk, Syne, Unbounded } from 'next/font/google'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getHomeContent } from '@/lib/content'

import './style.css'

const syne = Syne({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-syne', display: 'swap' })
const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument',
  display: 'swap',
})
const unbounded = Unbounded({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-unbounded', display: 'swap' })
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
})

const VIBES = ['violet', 'aqua', 'blush']

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings, draft } = await getHomeContent()
  const defaultVibe = VIBES.includes(settings.defaultVibe) ? settings.defaultVibe : 'violet'

  // Runs before paint: a visitor's saved vibe wins over the default from Site settings.
  const vibeScript = `try{var v=localStorage.getItem("mahnoor-vibe");if(${JSON.stringify(VIBES)}.indexOf(v)>-1)document.documentElement.setAttribute("data-vibe",v)}catch(e){}`

  return (
    <html
      lang="en"
      data-vibe={defaultVibe}
      className={`${syne.variable} ${instrument.variable} ${unbounded.variable} ${grotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: vibeScript }} />
      </head>
      <body>
        {children}
        {draft && <LivePreviewListener serverURL={process.env.NEXT_PUBLIC_SERVER_URL ?? ''} />}
      </body>
    </html>
  )
}
