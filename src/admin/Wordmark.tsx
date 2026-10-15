/** The real "mahnoor" logo: 7 letter PNGs used as CSS masks (see .ms-wm in custom.scss). */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`ms-wm ${className}`.trim()} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <i key={n} className={`ms-lt ms-l${n}`} />
      ))}
    </span>
  )
}

/** admin.components.graphics.Logo (login screen). */
export default function Logo() {
  return (
    <span className="ms-logo ms-logo--login">
      <Wordmark />
      <span className="ms-tagadmin">admin</span>
    </span>
  )
}

/** admin.components.graphics.Icon (small mark, e.g. in breadcrumbs). */
export function Icon() {
  return <Wordmark className="ms-wm--icon" />
}
