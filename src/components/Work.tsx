import { mediaUrl, type HomeContent, type Settings } from '@/lib/content'

import { SplitHeading } from './SplitHeading'

/** Same background the legacy .art-N classes used, built from the project's own image. */
export const artBackground = (url: string | undefined, position: string | null | undefined) =>
  url ? `url("${url}") ${position || 'center'}/cover, var(--night)` : 'var(--night)'

export function Work({ s, projects }: { s: Settings; projects: HomeContent['projects'] }) {
  if (!projects.length) return null

  return (
    <section className="section wrap" id="work" style={{ paddingTop: 0 }}>
      <div className="work-head">
        <SplitHeading className="h2" value={s.workHeading} />
        {s.workIntro && <p>{s.workIntro}</p>}
      </div>
      <div className="projects" id="projects">
        {projects.map((p, i) => {
          const panelId = `p${i + 1}`
          const bg = artBackground(mediaUrl(p.image), p.imagePosition)
          const links = [
            { ...p.primaryLink, cls: 'pill solid' },
            { ...p.secondaryLink, cls: 'pill ghost' },
          ].filter((l) => l.label && l.url)

          return (
            <div className="proj" key={p.id} data-bg={bg}>
              <button className="proj-btn" type="button" aria-expanded="false" aria-controls={panelId}>
                <span className="proj-title">{p.title}</span>
                <span className="proj-meta">
                  {p.category}
                  <br />
                  {p.year}
                </span>
                <span className="proj-plus" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              <div className="proj-panel" id={panelId}>
                <div>
                  <div className="panel-inner">
                    <div className="panel-art" style={{ background: bg }} />
                    <div className="panel-text">
                      <p>{p.description}</p>
                      {p.tags && p.tags.length > 0 && (
                        <div className="tags">
                          {p.tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      )}
                      {links.length > 0 && (
                        <div className="panel-links">
                          {links.map((l) => (
                            <a key={l.url} className={l.cls} href={l.url!} target="_blank" rel="noopener">
                              {l.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
