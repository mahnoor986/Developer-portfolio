'use client'

import { useEffect } from 'react'

import { initEffects, type EffectsConfig } from './effects/initEffects'

/**
 * All animations from legacy/js/main.js. Renders nothing; it wires up the server-rendered
 * markup after hydration and tears everything down on unmount (or when the content changes).
 */
export function Effects({ config }: { config: EffectsConfig }) {
  const key = JSON.stringify(config)

  useEffect(() => initEffects(JSON.parse(key) as EffectsConfig), [key])

  return null
}
