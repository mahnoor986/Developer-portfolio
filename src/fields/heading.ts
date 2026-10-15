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
 * A line break in the lead becomes <br>.
 */
export const headingField = ({ name, label, lead, accent }: HeadingOptions): Field => ({
  name,
  label,
  type: 'group',
  admin: {
    description: 'The accent part is shown in the vibe colour. Line breaks in the first part are kept.',
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
