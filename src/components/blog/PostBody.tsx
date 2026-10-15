import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { codeLanguages } from '@/lib/codeLanguages'

type CodeFields = { code?: string; language?: string }

/** Default Lexical rendering, plus our own markup for code blocks. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    Code: ({ node }: { node: { fields: CodeFields } }) => {
      const { code = '', language = 'plaintext' } = node.fields
      return (
        <figure className="post-code">
          <figcaption className="post-code-head">{codeLanguages[language] ?? language}</figcaption>
          <pre>
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </figure>
      )
    },
  },
})

export function PostBody({ data }: { data: SerializedEditorState }) {
  return <RichText className="post-body" data={data} converters={converters} />
}
