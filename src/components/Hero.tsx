import { Fragment } from 'react'

import type { Settings } from '@/lib/content'

import { CvButton, getCv } from './Cv'

const words = (text?: string | null) => (text ?? '').trim().split(/\s+/).filter(Boolean)

export function Hero({ s }: { s: Settings }) {
  const cv = getCv(s)
  const intro = [
    ...words(s.intro).map((w) => ({ w, muted: false })),
    ...words(s.introMuted).map((w) => ({ w, muted: true })),
  ]

  return (
    <section className="hero wrap" id="hero">
      <div className="hero-top">
        <div>
          {s.available && (
            <div className="status gb">
              <b />
              {s.availabilityText}
            </div>
          )}
          <p className="hero-intro">
            {intro.map(({ w, muted }, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span className={muted ? 'gw mu' : 'gw'}>{w}</span>
              </Fragment>
            ))}
          </p>
          {cv && <CvButton cv={cv} className="hero-cv" />}
        </div>
        <div className="grav">
          <button className="pill ghost" id="gravBtn" type="button" data-magnetic="" aria-pressed="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v14" />
              <path d="m6 12 6 6 6-6" />
            </svg>
            <span id="gravLabel">{s.gravityOn}</span>
          </button>
          <small id="gravHint">{s.gravityOnHint}</small>
        </div>
      </div>

      <h1 className="name" id="name" aria-label={s.name}>
        {[...s.name].map((ch, i) => (
          <span key={i} className="ch" aria-hidden="true">
            {ch}
          </span>
        ))}
      </h1>

      <div className="hero-bottom">
        <div className="hero-line">
          <b className="gb">{s.heroLabel}</b>
          <i className="gb" />
          <span className="hl-mid gb">{s.tagline}</span>
          <i className="hl-mid gb" />
          <span className="gb">{s.year}</span>
        </div>
        <a href="#about" className="badge" aria-label="Scroll to explore">
          <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <path id="badgeCirc" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text>
              <textPath href="#badgeCirc" textLength="236" lengthAdjust="spacing">
                {s.scrollBadge}
              </textPath>
            </text>
          </svg>
          <span className="core">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="m6 13 6 6 6-6" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  )
}

export function Marquee({ s }: { s: Settings }) {
  const list = s.marquee ?? []
  if (!list.length) return null
  // The words appear twice so the loop in Effects can wrap seamlessly.
  return (
    <div className="marquee" aria-hidden="true">
      <div className="track" id="track">
        {[0, 1].flatMap((copy) =>
          list.map((m, i) => (
            <span key={`${copy}-${i}`} className={i % 2 ? 'o' : undefined}>
              {m.word}
            </span>
          )),
        )}
      </div>
    </div>
  )
}
