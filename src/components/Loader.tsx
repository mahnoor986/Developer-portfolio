import { Wordmark } from './Wordmark'

export function Loader({ label }: { label: string }) {
  return (
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
  )
}
