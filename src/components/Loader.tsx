import { Wordmark } from './Wordmark'

/**
 * Runs as soon as the loader is in the page, before the (much later) JavaScript:
 * - a repeat visit in this tab hides the loader at once;
 * - a first visit is recorded right away, so it counts even if the visitor leaves before the JS starts;
 * - `__ldShownAt` lets initEffects know how long the loader has already been on screen.
 */
const loaderScript = `(function(){var l=document.getElementById('loader');window.__ldShownAt=performance.now();try{var k='mahnoor-intro-seen';window.__ldSkip=sessionStorage.getItem(k)==='1';sessionStorage.setItem(k,'1')}catch(e){}if(window.__ldSkip&&l)l.style.display='none'})()`

export function Loader({ label }: { label: string }) {
  return (
    <>
      <div id="loader" aria-hidden="true">
        <div className="ld-mark">
          <Wordmark className="ld-wm ld-back" />
          <Wordmark className="ld-wm ld-fill" />
        </div>
        <div className="ld-foot">
          <span className="ld-label">{label}</span>
          <span className="ld-count">
            <span id="countNum">0</span>
            <small>%</small>
          </span>
        </div>
        <div className="ld-bar">
          <i />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
    </>
  )
}
