import { RichText } from '@payloadcms/richtext-lexical/react'
import { Fragment } from 'react'

import { mediaUrl, type Settings } from '@/lib/content'

export function About({ s }: { s: Settings }) {
  const photo = mediaUrl(s.photo)
  const manifesto = (s.manifesto ?? '').trim().split(/\s+/).filter(Boolean)
  const facts = s.facts ?? []

  return (
    <section className="section wrap" id="about">
      {s.aboutKicker && <p className="kicker">{s.aboutKicker}</p>}
      {manifesto.length > 0 && (
        <p className="manifesto" id="manifesto">
          {manifesto.map((w, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <span className="w">{w}</span>
            </Fragment>
          ))}
        </p>
      )}

      <div className="about-grid">
        {photo && (
          <div className="photo">
            <div className="ph-card" data-tilt="">
              <span className="ph-layer l-a" aria-hidden="true" />
              <span className="ph-layer l-b" aria-hidden="true" />
              <div className="ph-frame">
                {/* eslint-disable-next-line @next/next/no-img-element -- same markup and sizing as the legacy site */}
                <img className="avatar" src={photo} alt={s.photoAlt ?? ''} />
              </div>
              <span className="ph-tag">
                {s.photoTagName} <i>{s.photoTagRole}</i>
              </span>
              <span className="ph-orb" aria-hidden="true" />
            </div>
          </div>
        )}
        <div className="about-copy">
          {s.aboutText && <RichText data={s.aboutText} disableContainer />}
          {facts.length > 0 && (
            <div className="facts">
              {facts.map((f) => (
                <div key={f.id ?? f.label}>
                  <b>{f.value}</b>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
