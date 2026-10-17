export const ADMIN_VIBE_KEY = 'mahnoor-admin-vibe'

export const VIBES = [
  { value: 'violet', label: 'Ultraviolet', sw: '#B38CFF', sw2: '#7B3CFF', night: '#120A1F' },
  { value: 'aqua', label: 'Aqua', sw: '#78E0E0', sw2: '#2FB5B8', night: '#08171A' },
  { value: 'blush', label: 'Blush', sw: '#F6B0BB', sw2: '#E2728A', night: '#1A0B10' },
] as const

export type Vibe = (typeof VIBES)[number]['value']

export const isVibe = (v: unknown): v is Vibe => VIBES.some((x) => x.value === v)
