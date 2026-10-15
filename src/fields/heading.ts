import type { Field } from 'payload'

type HeadingOptions = {
  name: string
  label: string
  lead: string
  accent: string
}

/**
 * A section heading made of a plain lead and an accented ending, e.g.
 * "Selected" + "work" → <h2>Selected<br><em class="ac">work</em></h2>.
 * A one-line lead puts the accent on its own line; otherwise each newline in the lead
 * becomes <br> and the accent follows the last line ("From idea\nto" + "launch").
 */
export const headingField = ({ name, label, lead, accent }: HeadingOptions): Field => ({
  name,
  label,
  type: 'group',
  admin: {
    description:
      'The accent part is shown in the vibe colour. If the text is a single line, the accent starts on a new line; otherwise line breaks in the text are kept and the accent follows the last line.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'lead', label: 'Text', type: 'textarea', defaultValue: lead, admin: { rows: 2 } },
        { name: 'accent', label: 'Accent', type: 'text', defaultValue: accent },
      ],
    },
  ],
})
