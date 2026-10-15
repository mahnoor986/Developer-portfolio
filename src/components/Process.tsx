import type { HomeContent, Settings } from '@/lib/content'

import { SplitHeading } from './SplitHeading'

export function Process({ s, steps }: { s: Settings; steps: HomeContent['steps'] }) {
  if (!steps.length) return null
  const total = steps.length

  return (
    <section className="process" id="process" aria-labelledby="processTitle">
      <div className="process-inner">
        <div className="wrap process-head">
          <div>
            {s.processKicker && <p className="kicker">{s.processKicker}</p>}
            <SplitHeading className="h2" id="processTitle" value={s.processHeading} />
            {s.processIntro && <p className="ph-desc">{s.processIntro}</p>}
          </div>
        </div>
        <div className="process-stage">
          <div className="ptrack" id="ptrack">
            {steps.map((step, i) => (
              <article className="pcard" key={step.id}>
                <span className="pnum" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pcube" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <span className="pstep">
                  {(s.stepLabel ?? '').replace('{n}', String(i + 1)).replace('{total}', String(total))}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {step.tags && step.tags.length > 0 && (
                  <div className="tags">
                    {step.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
        <div className="pbar" aria-hidden="true">
          <i id="pbar" />
        </div>
      </div>
    </section>
  )
}

export function Experience({ s, jobs }: { s: Settings; jobs: HomeContent['experience'] }) {
  if (!jobs.length) return null

  return (
    <section className="section wrap" id="experience">
      <div className="exp">
        <div className="exp-head">
          <SplitHeading className="h2" value={s.experienceHeading} />
          {s.experienceIntro && <p>{s.experienceIntro}</p>}
        </div>
        <div className="timeline" id="timeline">
          <div className="tl-line" />
          <div className="tl-fill" id="tlFill" />
          {jobs.map((job) => (
            <article className="job" key={job.id}>
              <time>{job.period}</time>
              <h3>{job.title}</h3>
              {job.organization && <h4>{job.organization}</h4>}
              {job.description && <p>{job.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
