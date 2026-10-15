/** The "mahnoor" logo: seven masked letter images (see .wm / .l1–.l7 in style.css). */
export function Wordmark({ className = '', id }: { className?: string; id?: string }) {
  return (
    <span className={`wm ${className}`.trim()} id={id} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <i key={n} className={`lt l${n}`} />
      ))}
    </span>
  )
}
