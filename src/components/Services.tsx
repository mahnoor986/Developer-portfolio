import type { HomeContent, Settings } from '@/lib/content'

import { SplitHeading } from './SplitHeading'

/** "Services": what Mahnoor sells, each card as problem → outcome, with a link that preselects the contact option. */
export function Services({ s, services }: { s: Settings; services: HomeContent['services'] }) {
  if (!services.length) return null

  return (
    <section className="section wrap services" id="services" aria-labelledby="servicesTitle">
      <div className="work-head">
        <div>
          {s.servicesKicker && <p className="kicker">{s.servicesKicker}</p>}
          <SplitHeading className="h2" id="servicesTitle" value={s.servicesHeading} />
        </div>
        {s.servicesIntro && <p>{s.servicesIntro}</p>}
      </div>

      <div className="svc-grid">
        {services.map((sv, i) => {
          const ask = sv.askOption && typeof sv.askOption === 'object' ? sv.askOption.label : null
          return (
            <article className="svc-card" key={sv.id} data-tilt="">
              <span className="svc-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{sv.title}</h3>
              <dl>
                <dt>{s.servicesProblemLabel}</dt>
                <dd>{sv.problem}</dd>
                <dt>{s.servicesOutcomeLabel}</dt>
                <dd>{sv.outcome}</dd>
              </dl>
              {ask && s.servicesAskLabel && (
                <a className="svc-ask" href="#collab" data-ask={ask}>
                  {s.servicesAskLabel}
                  <span aria-hidden="true"> →</span>
                </a>
              )}
            </article>
          )
        })}
      </div>

      {s.servicesNote && <p className="svc-note">{s.servicesNote}</p>}
    </section>
  )
}

/** "Why work with me": a short list of reasons. Hidden when empty. */
export function WhyMe({ s }: { s: Settings }) {
  const items = s.whyItems ?? []
  if (!items.length) return null

  return (
    <section className="section wrap why" id="why" aria-labelledby="whyTitle">
      <div className="work-head">
        <div>
          {s.whyKicker && <p className="kicker">{s.whyKicker}</p>}
          <SplitHeading className="h2" id="whyTitle" value={s.whyHeading} />
        </div>
      </div>
      <ul className="why-list">
        {items.map((item) => (
          <li key={item.id ?? item.title}>
            <b>{item.title}</b>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
