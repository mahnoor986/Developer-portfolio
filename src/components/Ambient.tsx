/** Fixed, decorative layers from the top of legacy/index.html (background, rocket, cursor, preview). */
const warpStreaks: [x: string, d: string, l: string][] = [
  ['8%', '0.00s', '120px'],
  ['17%', '0.30s', '80px'],
  ['26%', '0.12s', '160px'],
  ['34%', '0.45s', '90px'],
  ['43%', '0.20s', '140px'],
  ['57%', '0.38s', '110px'],
  ['64%', '0.05s', '170px'],
  ['72%', '0.27s', '90px'],
  ['81%', '0.50s', '130px'],
  ['90%', '0.15s', '100px'],
  ['95%', '0.33s', '150px'],
  ['50%', '0.60s', '70px'],
]

export function Backdrop() {
  return (
    <>
      <canvas id="bg" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div id="hero3d" aria-hidden="true" />
      <div className="warp" id="warp" aria-hidden="true">
        {warpStreaks.map(([x, d, l]) => (
          <i key={x + d} style={{ '--x': x, '--d': d, '--l': l } as React.CSSProperties} />
        ))}
      </div>
      <div className="flyer" id="flyer" aria-hidden="true">
        <span className="flame" />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c3 2.5 4.5 6 4.5 10l-2 4h-5l-2-4C7.5 8 9 4.5 12 2z" fill="var(--orchid)" stroke="var(--ink)" />
          <circle cx="12" cy="9.5" r="1.8" fill="var(--void)" stroke="var(--ink)" />
          <path d="M7.5 12 5 15l2.5 1M16.5 12l2.5 3-2.5 1" stroke="var(--ink)" />
        </svg>
      </div>
    </>
  )
}

export function Pointer() {
  return (
    <>
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true">
        <span id="cursorText" />
      </div>
      <div id="preview" aria-hidden="true">
        <span />
      </div>
    </>
  )
}
