'use client'

import { useAllFormFields, useDocumentInfo, useForm, useFormBackgroundProcessing, useFormModified, useFormProcessing } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type State = { value?: unknown }

function read(fields: Record<string, State>, path: string) {
  return fields[path]?.value
}

export function SiteSettingsSaveState() {
  const modified = useFormModified()
  const processing = useFormProcessing()
  const backgroundProcessing = useFormBackgroundProcessing()
  return <span className="ms-settings-save-state" aria-live="polite">{processing || backgroundProcessing ? 'Saving…' : modified ? 'Unsaved changes' : 'All changes saved'}</span>
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
  const { dispatchFields, setModified } = useForm()
  const cvState = fields.cv
  const cv = cvState?.value as { id?: string | number; filename?: string; url?: string; filesize?: number } | string | number | null | undefined
  const savedCV = initialData?.cv as { id?: string | number; filename?: string; url?: string; filesize?: number } | string | number | null | undefined
  const currentValue = cvState ? cv : savedCV
  const directFile = typeof currentValue === 'object' && currentValue?.filename ? currentValue : null
  const directFileJSON = directFile ? JSON.stringify(directFile) : ''
  const relationID = typeof currentValue === 'object' && currentValue ? currentValue.id : currentValue
  const [resolved, setResolved] = useState<{
    id: string | number
    file: { filename?: string; url?: string; filesize?: number } | null
  } | null>(null)

  useEffect(() => {
    if (directFileJSON || relationID === null || relationID === undefined || relationID === '') return

    let active = true
    fetch(`/api/media/${encodeURIComponent(String(relationID))}?depth=0`, { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : null)
      .then((media: { filename?: string; url?: string; filesize?: number } | null) => {
        if (active) setResolved({ id: relationID, file: media?.filename ? media : null })
      })
      .catch(() => { if (active) setResolved({ id: relationID, file: null }) })

    return () => { active = false }
  }, [directFileJSON, relationID])

  const file = (directFileJSON ? JSON.parse(directFileJSON) : null) ?? (resolved && resolved.id === relationID ? resolved.file : null)
  const filename = file?.filename
  const formatSize = (bytes?: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : 'PDF uploaded'
  const openCVField = () => {
    const field = document.querySelector<HTMLElement>('[data-field-path="cv"]') ?? document.getElementById('field-cv')?.parentElement ?? null
    const input = field?.querySelector<HTMLInputElement>('input[type="file"]')
    if (input) input.click()
    else field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const removeCV = () => {
    setModified(true)
    dispatchFields({ type: 'UPDATE', path: 'cv', value: null })
  }
  return <section className="ms-settings-cv" aria-live="polite">
    <span className="ms-settings-eyebrow">CV DOWNLOAD</span>
    {filename ? <div className="ms-settings-cv-file"><span className="ms-settings-cv-icon" aria-hidden="true">PDF</span><span className="ms-settings-cv-meta"><strong>{filename}</strong><span>{formatSize(file?.filesize)} · live on your site</span></span><span className="ms-settings-cv-actions"><button className="ms-pill" type="button" onClick={openCVField}>Replace</button><button className="ms-pill danger" type="button" onClick={removeCV}>Remove</button></span></div> : <><strong>No CV uploaded</strong><span>The “Download CV” button stays hidden on your site until you upload a PDF.</span><button className="ms-pill solid ms-settings-cv-choose" type="button" onClick={openCVField}>Choose PDF</button></>}
  </section>
}
