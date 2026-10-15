'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { initEffects, type EffectsConfig } from './effects/initEffects'

/**
 * All animations from legacy/js/main.js. Renders nothing; it wires up the server-rendered
 * markup after hydration and tears everything down on unmount, when the content changes, or
 * when the page changes (e.g. from one blog post to the next, where React keeps this component).
 */
export function Effects({ config }: { config: EffectsConfig }) {
  const key = JSON.stringify(config)
  const pathname = usePathname()

  useEffect(() => initEffects(JSON.parse(key) as EffectsConfig), [key, pathname])

  return null
}
