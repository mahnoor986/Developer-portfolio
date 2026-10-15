import type { Settings } from '@/lib/content'

import { Wordmark } from './Wordmark'

export function Footer({ s }: { s: Settings }) {
  const text = (s.footerText ?? '').replace('{year}', String(new Date().getFullYear()))

  return (
    <footer className="foot">
      <div className="wrap foot-bar">
        <span>{text}</span>
        <a href="#home" className="totop" id="toTop" aria-label="Back to top">
          <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="topCirc" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
            </defs>
            <text>
              <textPath href="#topCirc" textLength="286" lengthAdjust="spacing">
                {s.backToTop}
              </textPath>
            </text>
          </svg>
          <span className="trail" aria-hidden="true" />
          <span className="core">
            <svg className="rocket" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2c3 2.5 4.5 6 4.5 10l-2 4h-5l-2-4C7.5 8 9 4.5 12 2z" />
              <circle cx="12" cy="9.5" r="1.6" />
              <path d="M7.5 12 5 15l2.5 1M16.5 12l2.5 3-2.5 1M10.5 19.5 12 22l1.5-2.5" />
            </svg>
          </span>
        </a>
      </div>
      <div className="wrap foot-mark" aria-hidden="true">
        <Wordmark className="big" id="footMark" />
      </div>
    </footer>
  )
}
