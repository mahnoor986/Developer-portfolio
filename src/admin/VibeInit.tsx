'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect } from 'react'

import { ADMIN_VIBE_KEY, isVibe } from './vibe'

/** admin.components.providers: also covers pages without the default template (login). */
export function VibeProvider({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    try {
      const v = localStorage.getItem(ADMIN_VIBE_KEY)
      if (isVibe(v)) document.documentElement.setAttribute('data-vibe', v)
    } catch {
      /* private mode */
    }
  }, [])

  useEffect(() => {
    if (pathname !== '/admin/globals/site-settings' || new URLSearchParams(window.location.search).get('tab') !== 'CV') return

    const selectCV = () => {
      const cvTab = [...document.querySelectorAll<HTMLButtonElement>('.tabs-field__tab-button')].find(
        (button) => button.textContent?.trim() === 'CV',
      )
      if (!cvTab) return false
      if (!cvTab.classList.contains('tabs-field__tab-button--active')) cvTab.click()
      return true
    }

    if (selectCV()) return
    const observer = new MutationObserver(() => {
      if (selectCV()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => observer.disconnect(), 5000)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [pathname])

  return <>{children}</>
}
