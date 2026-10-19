'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'

export type MediaCard = {
  id: string
  filename: string
  alt: string
  mimeType: string
  filesize: number
  width: number | null
  height: number | null
  url: string | null
  inUseBy: string[]
}
type Filter = 'all' | 'images' | 'pdfs'
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'images', label: 'Images' },
  { value: 'pdfs', label: 'PDFs' },
]

const isImage = (file: MediaCard) => file.mimeType.startsWith('image/')
const formatSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / 1024 / 1024).toFixed(1)} MB`

async function readMedia(): Promise<MediaCard[]> {
  const response = await fetch('/api/media?limit=1000&sort=-createdAt', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not refresh media files.')
  const result = await response.json() as { docs: Array<Record<string, unknown>> }
  return result.docs.map((doc) => ({
    id: String(doc.id),
    filename: String(doc.filename ?? 'Untitled file'),
    alt: String(doc.alt ?? ''),
    mimeType: String(doc.mimeType ?? 'application/octet-stream'),
    filesize: Number(doc.filesize ?? 0),
    width: typeof doc.width === 'number' ? doc.width : null,
    height: typeof doc.height === 'number' ? doc.height : null,
    url: typeof doc.url === 'string' ? doc.url : null,
    inUseBy: [],
  }))
}

export default function MediaClient({ initialFiles }: { initialFiles: MediaCard[] }) {
  const router = useRouter()
  const uploadRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState(initialFiles)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const counts = useMemo(() => ({
    all: files.length,
    images: files.filter(isImage).length,
    pdfs: files.filter((file) => file.mimeType === 'application/pdf').length,
  }), [files])
  const visible = useMemo(() => files.filter((file) => {
    const matchesType = filter === 'all' || (filter === 'images' ? isImage(file) : file.mimeType === 'application/pdf')
    const search = query.trim().toLocaleLowerCase()
    const matchesQuery = !search || `${file.filename} ${file.alt}`.toLocaleLowerCase().includes(search)
    return matchesType && matchesQuery
  }), [files, filter, query])

  const refresh = async () => {
    const previousUsage = new Map(files.map((file) => [file.id, file.inUseBy]))
    const fresh = await readMedia()
    setFiles(fresh.map((file) => ({ ...file, inUseBy: previousUsage.get(file.id) ?? [] })))
    router.refresh()
  }

  const upload = async (selected: FileList | null) => {
    if (!selected?.length) return
    setUploading(true)
    setFeedback('')
    try {
      const filesToUpload = Array.from(selected)
      for (const file of filesToUpload) {
        const body = new FormData()
        body.append('file', file)
        const response = await fetch('/api/media', { method: 'POST', credentials: 'same-origin', body })
        if (!response.ok) throw new Error(`${file.name} could not be uploaded.`)
      }
      await refresh()
      setFeedback(filesToUpload.length === 1 ? 'File uploaded.' : `${filesToUpload.length} files uploaded.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Files could not be uploaded.')
      await refresh().catch(() => undefined)
    } finally {
      setUploading(false)
      if (uploadRef.current) uploadRef.current.value = ''
    }
  }

  const remove = async (file: MediaCard) => {
    if (file.inUseBy.length) return
    if (!window.confirm(`Delete “${file.filename}”? This cannot be undone.`)) return
    setBusy(file.id)
    setFeedback('')
    try {
      const response = await fetch(`/api/media/${encodeURIComponent(file.id)}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { errors?: Array<{ message?: string }> } | null
        throw new Error(body?.errors?.[0]?.message ?? 'File could not be deleted.')
      }
      await refresh()
      setFeedback('File deleted.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'File could not be deleted.')
    } finally { setBusy(null) }
  }

  return <section className="ms-media" aria-labelledby="ms-media-heading">
    <header className="ms-media-heading">
      <div><span className="ms-lbl">Content</span><h1 className="ms-projects-title" id="ms-media-heading">Media</h1><p className="ms-sub">Images and PDFs used on your site.</p></div>
      <label className={`ms-pill solid ms-media-upload${uploading ? ' is-uploading' : ''}`}>
        {uploading ? 'Uploading…' : '+ Upload files'}
        <input ref={uploadRef} type="file" accept="image/*,application/pdf" multiple disabled={uploading} aria-label="Upload image or PDF files" onChange={(event) => void upload(event.target.files)} />
      </label>
    </header>
    <div className="ms-media-toolbar">
      <div className="ms-projects-filters" role="group" aria-label="Filter media">
        {filters.map((item) => <button key={item.value} type="button" className={`ms-pill${filter === item.value ? ' on' : ''}`} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
          {item.label}<span className="n">{counts[item.value]}</span>
        </button>)}
      </div>
      <label className="ms-projects-search">
        <span className="ms-projects-search-icon" aria-hidden="true">⌕</span>
        <span className="ms-visually-hidden">Search media</span>
        <input type="search" aria-label="Search media" placeholder="Search files" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
    </div>
    {feedback && <p className="ms-projects-feedback" role="status">{feedback}</p>}
    <div className="ms-media-grid">
      {visible.map((file) => <article className="ms-media-card" key={file.id}>
        <div className="ms-media-preview">
          {isImage(file) && file.url
            ? <div className="ms-media-image" role="img" aria-label={file.alt || file.filename} style={{ backgroundImage: `url("${file.url.replaceAll('"', '%22')}")` }} />
            : <span className="ms-media-pdf" aria-label="PDF file">PDF</span>}
        </div>
        <div className="ms-media-card-info">
          <div className="ms-media-copy"><strong title={file.filename}>{file.filename}</strong><span>{formatSize(file.filesize)}{file.width && file.height ? ` · ${file.width}×${file.height}` : ''} · {file.mimeType}</span></div>
          {file.inUseBy.length ? <div className="ms-media-in-use" title={`Used by ${file.inUseBy.join(', ')}`}>In use · {file.inUseBy.join(', ')}</div> : <button className="ms-ib danger" type="button" aria-label={`Delete ${file.filename}`} disabled={busy === file.id || uploading} onClick={() => void remove(file)}>×</button>}
        </div>
      </article>)}
      {visible.length === 0 && <p className="ms-projects-empty">{files.length ? 'No files match.' : 'No files yet.'}</p>}
    </div>
  </section>
}
