'use client'

import { useAllFormFields, useDocumentInfo, useFormModified, useFormProcessing } from '@payloadcms/ui'

type State = { value?: unknown }

function read(fields: Record<string, State>, path: string) {
  return fields[path]?.value
}

export function SiteSettingsSaveState() {
  const modified = useFormModified()
  const processing = useFormProcessing()
  return <span className="ms-settings-save-state" aria-live="polite">{processing ? 'Saving…' : modified ? 'Unsaved changes' : 'All changes saved'}</span>
}

export function ContactHeadingPreview() {
  const [fields] = useAllFormFields()
  const lead = String(read(fields, 'contactHeading.lead') ?? "Got an idea?\nLet's make it")
  const accent = String(read(fields, 'contactHeading.accent') ?? 'real.')
  const lines = lead.split('\n')
  return <section className="ms-settings-preview" aria-label="Contact heading preview">
    <span className="ms-settings-eyebrow">LIVE PREVIEW · CONTACT</span>
    <h2>{lines.map((line, index) => <span key={`${index}-${line}`}>{line}{index < lines.length - 1 && <br />}</span>)}{accent && <>{lines.length === 1 ? <br /> : ' '}<em>{accent}</em></>}</h2>
  </section>
}

export function CVState() {
  const [fields] = useAllFormFields()
  const { initialData } = useDocumentInfo()
  const cv = read(fields, 'cv') as { value?: { filename?: string; url?: string; filesize?: number } } | number | null | undefined
  const draftFile = typeof cv === 'object' && cv ? cv.value : null
  const savedCV = initialData?.cv as { filename?: string; url?: string; filesize?: number } | number | null | undefined
  const file = draftFile?.filename ? draftFile : typeof savedCV === 'object' && savedCV ? savedCV : null
  const filename = file?.filename
  const formatSize = (bytes?: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : 'PDF uploaded'
  return <section className="ms-settings-cv" aria-live="polite">
    <span className="ms-settings-eyebrow">CV DOWNLOAD</span>
    {filename ? <><strong>{filename}</strong><span>{formatSize(file?.filesize)} · live on your site</span><span>Use the PDF field below to replace or remove this file.</span></> : <><strong>No CV uploaded</strong><span>The “Download CV” button stays hidden on your site until you upload a PDF.</span><span>Choose a PDF with the field below.</span></>}
  </section>
}
