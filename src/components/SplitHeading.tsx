import { Fragment } from 'react'

type Props = {
  value?: { lead?: string | null; accent?: string | null } | null
  className: string
  id?: string
}

/**
 * Two-part heading: "Selected" + "work" → Selected<br><em class="ac">work</em>.
 * A one-line lead puts the accent on its own line; a multi-line lead keeps its
 * line breaks and the accent follows the last line ("From idea\nto" + "launch").
 */
export function SplitHeading({ value, className, id }: Props) {
  const lines = (value?.lead ?? '').split('\n')
  const accent = value?.accent ?? ''

  return (
    <h2 className={className} id={id}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
      {accent && (
        <>
          {lines.length === 1 ? <br /> : ' '}
          <em className="ac">{accent}</em>
        </>
      )}
    </h2>
  )
}
