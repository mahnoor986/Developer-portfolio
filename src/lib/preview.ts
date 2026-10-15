import type { RootLivePreviewConfig } from 'payload'

/** Where a document is shown on the site. */
export const pathFor = (collection: string | undefined, data: Record<string, unknown>) =>
  collection === 'posts' && typeof data?.slug === 'string' && data.slug ? `/blog/${data.slug}` : '/'

/** The URL Payload loads in the Live Preview iframe: turns on draft mode, then opens the page. */
export const previewUrl = (path: string) => {
  const params = new URLSearchParams({ secret: process.env.PREVIEW_SECRET ?? '', path })
  return `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/api/preview?${params.toString()}`
}

export const livePreview: RootLivePreviewConfig = {
  collections: ['projects', 'posts'],
  globals: ['site-settings'],
  url: ({ data, collectionConfig }) => previewUrl(pathFor(collectionConfig?.slug, data)),
  breakpoints: [
    { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
    { name: 'tablet', label: 'Tablet', width: 820, height: 1180 },
    { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
  ],
}
