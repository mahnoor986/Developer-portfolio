import type { Settings } from '@/lib/content'

/**
 * The uploaded CV, or null when there is none (every CV button then hides itself).
 * `?v=` changes whenever the file is replaced, so browsers never serve an old copy.
 */
export function getCv(s: Settings) {
  const cv = s.cv
  if (!cv || typeof cv !== 'object' || !cv.url || cv.mimeType !== 'application/pdf') return null
  const version = cv.updatedAt ? Date.parse(cv.updatedAt) : 0
  const href = `${cv.url}${cv.url.includes('?') ? '&' : '?'}v=${version}`
  const fileName = `${(s.fullName || 'CV').replace(/[^\p{L}\p{N}]+/gu, '-')}-CV.pdf`
  return { href, fileName, label: s.cvLabel || 'Download CV', title: s.cvTitle || 'CV' }
}

export type CvInfo = NonNullable<ReturnType<typeof getCv>>

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
)

/** Pill-style download button (hero and contact card). */
export function CvButton({ cv, className = '' }: { cv: CvInfo; className?: string }) {
  return (
    <a className={`pill ghost small ${className}`.trim()} href={cv.href} download={cv.fileName} target="_blank" rel="noopener">
      <DownloadIcon />
      <span>{cv.label}</span>
    </a>
  )
}
