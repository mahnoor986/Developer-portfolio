import type { Settings } from '@/lib/content'

import { getCv } from './Cv'
import { Wordmark } from './Wordmark'

const vibeButtons = [
  { vibe: 'violet', name: 'Ultraviolet', sw: '#B38CFF', sw2: '#7B3CFF' },
  { vibe: 'aqua', name: 'Aqua', sw: '#78E0E0', sw2: '#2FB5B8' },
  { vibe: 'blush', name: 'Blush', sw: '#F6B0BB', sw2: '#E2728A' },
] as const

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
)

export function Header({ s }: { s: Settings }) {
  return (
    <header className="top" id="top">
      <nav className="navpill" aria-label="Main">
        <a href="#home" className="logo" aria-label={`${s.name}, back to top`}>
          <Wordmark id="wm" />
        </a>
        <div className="nav-right">
          <div className="vibes" role="radiogroup" aria-label="Colour theme">
            <span className="vibes-label">{s.vibesLabel}</span>
            {vibeButtons.map((v) => (
              <button
                key={v.vibe}
                className="vibe"
                type="button"
                role="radio"
                aria-checked={v.vibe === s.defaultVibe}
                data-vibe={v.vibe}
                data-name={v.name}
                style={{ '--sw': v.sw, '--sw2': v.sw2 } as React.CSSProperties}
              >
                <i />
                <span className="tip">{v.name}</span>
              </button>
            ))}
          </div>
          <a href="#collab" className="nav-cta" data-magnetic="">
            {s.ctaLabel}
            <Arrow />
          </a>
          <button className="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mmenu">
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  )
}

const MenuLink = ({ href, label, className }: { href: string; label?: string | null; className?: string }) =>
  label ? (
    <a href={href} className={className}>
      <span className="mm-t">
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
    </a>
  ) : null

export function MobileMenu({ s }: { s: Settings }) {
  const cv = getCv(s)
  return (
    <div className="mmenu" id="mmenu" aria-hidden="true">
      <div className="mm-inner wrap">
        <nav className="mm-links" aria-label="Menu">
          <MenuLink href="#about" label={s.menuAbout} />
          <MenuLink href="#work" label={s.menuWork} />
          <MenuLink href="#skills" label={s.menuToolkit} />
          <MenuLink href="#process" label={s.menuProcess} />
          <MenuLink href="#experience" label={s.menuExperience} />
          <MenuLink href="#collab" label={s.menuContact} className="o" />
        </nav>
        <div className="mm-side">
          <div>
            <h3>{s.menuSayHi}</h3>
            <a href={`mailto:${s.email}`}>{s.email}</a>
          </div>
          {(s.githubUrl || s.linkedinUrl) && (
            <div>
              <h3>{s.menuSocials}</h3>
              {s.githubUrl && (
                <a href={s.githubUrl} target="_blank" rel="noopener">
                  GitHub
                </a>
              )}
              {s.linkedinUrl && (
                <a href={s.linkedinUrl} target="_blank" rel="noopener">
                  LinkedIn
                </a>
              )}
            </div>
          )}
          {cv && (
            <div>
              <h3>{cv.title}</h3>
              <a href={cv.href} download={cv.fileName} target="_blank" rel="noopener">
                {cv.label}
              </a>
            </div>
          )}
          {s.available && (
            <div className="status">
              <b />
              {s.availabilityText}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
