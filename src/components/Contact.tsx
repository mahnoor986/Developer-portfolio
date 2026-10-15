import type { HomeContent, Settings } from '@/lib/content'

import { SplitHeading } from './SplitHeading'

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
)

export function Contact({ s, options }: { s: Settings; options: HomeContent['contactOptions'] }) {
  const socials = [
    { label: 'GitHub', url: s.githubUrl },
    { label: 'LinkedIn', url: s.linkedinUrl },
  ].filter((x) => x.url)

  return (
    <section className="section collab" id="collab">
      <div className="curl" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path id="curlPath" d="M0 120 L1440 120 Z" />
          <path className="glint" id="curlGlint" d="" />
        </svg>
      </div>
      <div className="wrap">
        <div className="collab-head">
          <div>
            {s.contactKicker && <p className="kicker">{s.contactKicker}</p>}
            <SplitHeading className="big-cta" value={s.contactHeading} />
          </div>
          {s.contactSubtext && <p className="collab-sub">{s.contactSubtext}</p>}
        </div>

        <div className="collab-grid">
          <form className="collab-form" id="collabForm" noValidate>
            {options.length > 0 && (
              <fieldset className="opts">
                <legend>{s.optionsLabel}</legend>
                {options.map((o, i) => (
                  <label className="opt" key={o.id}>
                    <input type="radio" name="type" value={o.label} defaultChecked={i === 0} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <div className="row2">
              <div className="field">
                <input id="fName" name="name" type="text" placeholder=" " autoComplete="name" required />
                <label htmlFor="fName">{s.nameLabel}</label>
              </div>
              <div className="field">
                <input id="fEmail" name="email" type="email" placeholder=" " autoComplete="email" required />
                <label htmlFor="fEmail">{s.emailLabel}</label>
              </div>
            </div>
            <div className="field">
              <textarea id="fMsg" name="message" rows={5} placeholder=" " required />
              <label htmlFor="fMsg">{s.messageLabel}</label>
            </div>
            <div className="form-foot">
              <p className="form-note" id="formNote" role="status" aria-live="polite">
                {s.formNote}
              </p>
              <button className="send" type="submit" data-magnetic="">
                <span>{s.sendLabel}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </form>

          <aside className="collab-side">
            {(s.available || s.location) && (
              <div className="card avail">
                {s.available && (
                  <div className="status">
                    <b />
                    {s.availabilityText}
                  </div>
                )}
                {s.location && <p>{s.location}</p>}
              </div>
            )}
            <div className="card" data-tilt="">
              <h3>{s.emailCardTitle}</h3>
              <a className="addr" href={`mailto:${s.email}`} id="emailLink">
                {s.email}
              </a>
              <button className="pill ghost small" type="button" id="copyBtn">
                {s.copyEmailLabel}
              </button>
            </div>
            {socials.length > 0 && (
              <div className="card" data-tilt="">
                <h3>{s.socialsTitle}</h3>
                <ul className="socials">
                  {socials.map((x) => (
                    <li key={x.label}>
                      <a href={x.url!} target="_blank" rel="noopener">
                        <span>{x.label}</span>
                        <Arrow />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
