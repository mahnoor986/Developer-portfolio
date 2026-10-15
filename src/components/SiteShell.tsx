import type { Settings } from '@/lib/content'

import { Backdrop, Pointer } from './Ambient'
import { Effects } from './Effects'
import type { EffectsConfig } from './effects/initEffects'
import { Footer } from './Footer'
import { Header, MobileMenu } from './Header'
import { Loader } from './Loader'

type Props = {
  s: Settings
  /** Home page: in-page links (#about). Other pages: links back to the home page (/#about). */
  onHome: boolean
  hasPosts: boolean
  children: React.ReactNode
}

const effectsConfig = (s: Settings): EffectsConfig => ({
  labels: {
    gravityOn: s.gravityOn ?? '',
    gravityOnHint: s.gravityOnHint ?? '',
    gravityOff: s.gravityOff ?? '',
    gravityOffHint: s.gravityOffHint ?? '',
    cursorOpen: s.cursorOpen ?? '',
    cursorDrag: s.cursorDrag ?? '',
    cursorThrow: s.cursorThrow ?? '',
    vibeToast: s.vibeToast ?? '',
    copyEmail: s.copyEmailLabel ?? '',
    copied: s.copiedLabel ?? '',
  },
})

/** Background layers, header, menu, footer and animations shared by every public page. */
export function SiteShell({ s, onHome, hasPosts, children }: Props) {
  return (
    <>
      <Backdrop />
      {onHome && <Loader label={s.loaderLabel ?? ''} />}
      <Pointer />

      <Header s={s} onHome={onHome} />
      <MobileMenu s={s} onHome={onHome} hasPosts={hasPosts} />

      <main id="home">{children}</main>

      <Footer s={s} />
      <div className="vibe-toast" id="vibeToast" role="status" aria-live="polite" />

      <Effects config={effectsConfig(s)} />
    </>
  )
}
