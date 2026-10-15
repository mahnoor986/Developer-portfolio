import type { HomeContent, Settings } from '@/lib/content'

import { SplitHeading } from './SplitHeading'

const icons = {
  fe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </svg>
  ),
  be: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  ),
  tl: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0 5 5l-8.4 8.4a2.1 2.1 0 0 1-3-3z" />
      <path d="M14.7 6.3 17 4l3 3-2.3 2.3" />
    </svg>
  ),
}

type Cat = keyof typeof icons

const d = (n: number) => ({ '--d': n }) as React.CSSProperties

export function Toolkit({ s, skills }: { s: Settings; skills: HomeContent['skills'] }) {
  if (!skills.length) return null

  const cats = (
    [
      ['fe', s.frontend],
      ['be', s.backend],
      ['tl', s.tools],
    ] as const
  )
    .map(([key, c]) => ({ key: key as Cat, c, items: skills.filter((sk) => sk.category === key) }))
    .filter((cat) => cat.items.length > 0)

  const exploring = s.exploring ?? []

  return (
    <section className="section wrap" id="skills" style={{ paddingTop: 0 }}>
      <div className="process-head" style={{ marginBottom: 'clamp(24px,4vw,48px)' }}>
        <SplitHeading className="h2" value={s.toolkitHeading} />
      </div>
      <div className="skills-grid">
        <div className="orbit-wrap" id="orbit" aria-label="Interactive sphere of my skills. Drag to spin it.">
          <canvas className="orbit-lines" id="orbitLines" aria-hidden="true" />
          <div className="orbit-ring" />
          <div className="orbit-core" />
          <span className="orbit-hint">{s.sphereHint}</span>
          {skills.map((sk) => (
            <span key={sk.id} className="orbit-word" data-cat={sk.category}>
              {sk.name}
            </span>
          ))}
        </div>
        <div className="tk">
          <div className="tk-tabs" role="tablist" aria-label="Skill categories">
            <button className="tk-tab" role="tab" id="tab-all" aria-selected="true" aria-controls="tp-all" data-cat="all">
              {s.toolkitOverviewTab}
            </button>
            {cats.map(({ key, c, items }) => (
              <button
                key={key}
                className="tk-tab"
                role="tab"
                id={`tab-${key}`}
                aria-selected="false"
                aria-controls={`tp-${key}`}
                data-cat={key}
                tabIndex={-1}
              >
                {c?.tabLabel} <small>{items.length}</small>
              </button>
            ))}
          </div>
          <div className="tk-panel" role="tabpanel" id="tp-all" aria-labelledby="tab-all">
            {s.toolkitTitle && <h3>{s.toolkitTitle}</h3>}
            {s.toolkitText && <p>{s.toolkitText}</p>}
            <div className="tk-cards">
              {cats.map(({ key, c, items }, i) => (
                <button key={key} className="tk-card" type="button" data-go={key} style={d(i)}>
                  <span className="tk-ico">{icons[key]}</span>
                  <span>
                    <b>{c?.tabLabel}</b>
                    <span>{c?.cardText}</span>
                  </span>
                  <em>
                    {items.length} {c?.countWord}
                  </em>
                </button>
              ))}
            </div>
          </div>
          {cats.map(({ key, c, items }) => (
            <div key={key} className="tk-panel" role="tabpanel" id={`tp-${key}`} aria-labelledby={`tab-${key}`} hidden>
              <h3>{c?.title}</h3>
              {c?.text && <p>{c.text}</p>}
              <ul className="tk-grid">
                {items.map((sk, i) => (
                  <li key={sk.id} style={d(i)}>
                    <b>{sk.name}</b>
                    {sk.blurb && <span>{sk.blurb}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {exploring.length > 0 && (
            <div className="tk-explore">
              <p>
                <b />
                {s.exploringLabel}
              </p>
              {exploring.map((e) => (
                <span key={e.id ?? e.item}>{e.item}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
