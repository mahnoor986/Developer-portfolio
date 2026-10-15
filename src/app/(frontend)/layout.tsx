import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getSiteSettings, isDraftMode } from '@/lib/content'
import { fontVariables } from '@/lib/fonts'

import './style.css'

const VIBES = ['violet', 'aqua', 'blush']

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, draft] = await Promise.all([getSiteSettings(), isDraftMode()])
  const defaultVibe = VIBES.includes(settings.defaultVibe) ? settings.defaultVibe : 'violet'

  // Runs before paint: a visitor's saved vibe wins over the default from Site settings.
  const vibeScript = `try{var v=localStorage.getItem("mahnoor-vibe");if(${JSON.stringify(VIBES)}.indexOf(v)>-1)document.documentElement.setAttribute("data-vibe",v)}catch(e){}`

  return (
    <html
      lang="en"
      data-vibe={defaultVibe}
      className={fontVariables}
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
