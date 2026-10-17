'use client'

import { useLayoutEffect } from 'react'

import { ADMIN_VIBE_KEY, isVibe } from './vibe'

/** admin.components.providers: also covers pages without the default template (login). */
export function VibeProvider({ children }: { children?: React.ReactNode }) {
  useLayoutEffect(() => {
    try {
      const v = localStorage.getItem(ADMIN_VIBE_KEY)
      if (isVibe(v)) document.documentElement.setAttribute('data-vibe', v)
    } catch {
      /* private mode */
    }
  }, [])
  return <>{children}</>
}
