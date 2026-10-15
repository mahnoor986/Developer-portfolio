import type { Field, GlobalConfig, TextareaField, TextField } from 'payload'

import { anyone, authenticated } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { headingField } from '../fields/heading'

export const vibes = [
  { label: 'Ultraviolet', value: 'violet' },
  { label: 'Aqua', value: 'aqua' },
  { label: 'Blush', value: 'blush' },
] as const

type Extra<T> = Partial<Omit<T, 'name' | 'type'>>

const text = (name: string, label: string, defaultValue?: string, extra: Extra<TextField> = {}): Field =>
  ({ name, label, type: 'text', defaultValue, ...extra }) as TextField

const textarea = (name: string, label: string, extra: Extra<TextareaField> = {}): Field =>
  ({ name, label, type: 'textarea', ...extra }) as TextareaField

/** One toolkit category (Frontend / Backend / Tools). */
const toolkitCategory = (name: string, label: string, countWord: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        text('tabLabel', 'Tab label', label),
        text('title', 'Panel title', label),
        text('countWord', 'Count word', countWord, {
          admin: { description: `"10 ${countWord}" on the overview card` },
        }),
      ],
    },
    textarea('text', 'Panel text'),
    text('cardText', 'Overview card text'),
  ],
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Content' },
  access: {
    read: anyone,
    update: authenticated,
  },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General & SEO',
          fields: [
            {
              type: 'row',
              fields: [
                text('name', 'Short name', 'Mahnoor', {
                  required: true,
                  admin: { description: 'The big letters in the hero.' },
                }),
                text('fullName', 'Full name', 'Mahnoor Siddiqui', { required: true }),
              ],
            },
            text('metaTitle', 'Page title (SEO)', undefined, { required: true }),
            textarea('metaDescription', 'Description (SEO)', { required: true }),
            {
              name: 'defaultVibe',
              label: 'Default colour vibe',
              type: 'select',
              defaultValue: 'violet',
              required: true,
              options: [...vibes],
              admin: { description: 'Visitors who already picked a vibe keep their own choice.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'available',
                  label: 'Available for work',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { description: 'Shows the green status badge.' },
                },
                text('availabilityText', 'Status text', 'Available for new projects'),
              ],
            },
          ],
        },
        {
          label: 'Hero',
          fields: [
            textarea('intro', 'Intro', { admin: { rows: 2 } }),
            textarea('introMuted', 'Intro, muted part', {
              admin: { rows: 2, description: 'Shown right after the intro, in a lighter colour.' },
            }),
            {
              type: 'row',
              fields: [
                text('heroLabel', 'Label', 'Mahnoor, developer'),
                text('tagline', 'Tagline', '[ full-stack & games ]'),
                text('year', 'Year', '2026'),
              ],
            },
            {
              name: 'marquee',
              label: 'Marquee words',
              type: 'array',
              admin: { description: 'The scrolling words under the hero. Every second word is highlighted.' },
              fields: [{ name: 'word', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'About',
          fields: [
            text('aboutKicker', 'Kicker', 'About me'),
            textarea('manifesto', 'Manifesto', { admin: { rows: 3 } }),
            {
              name: 'aboutText',
              label: 'About text',
              type: 'richText',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  filterOptions: { mimeType: { contains: 'image' } },
                },
                text('photoAlt', 'Photo alt text'),
              ],
            },
            {
              type: 'row',
              fields: [
                text('photoTagName', 'Photo tag', 'Mahnoor'),
                text('photoTagRole', 'Photo tag, italic part', 'developer'),
              ],
            },
            {
              name: 'facts',
              type: 'array',
              maxRows: 6,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sections',
          fields: [
            {
              type: 'collapsible',
              label: 'Selected work',
              fields: [
                headingField({ name: 'workHeading', label: 'Heading', lead: 'Selected', accent: 'work' }),
                textarea('workIntro', 'Intro'),
              ],
            },
            {
              type: 'collapsible',
              label: 'My toolkit',
              fields: [
                headingField({ name: 'toolkitHeading', label: 'Heading', lead: 'My', accent: 'toolkit' }),
                text('toolkitOverviewTab', 'Overview tab label', 'Overview'),
                text('toolkitTitle', 'Overview title'),
                textarea('toolkitText', 'Overview text'),
                toolkitCategory('frontend', 'Frontend', 'skills'),
                toolkitCategory('backend', 'Backend', 'skills'),
                toolkitCategory('tools', 'Tools', 'tools'),
                text('exploringLabel', '"Currently exploring" label', 'Currently exploring'),
                {
                  name: 'exploring',
                  label: 'Currently exploring',
                  type: 'array',
                  fields: [{ name: 'item', type: 'text', required: true }],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'How I build',
              fields: [
                text('processKicker', 'Kicker', 'How I build'),
                headingField({ name: 'processHeading', label: 'Heading', lead: 'From idea\nto', accent: 'launch' }),
                textarea('processIntro', 'Intro'),
              ],
            },
            {
              type: 'collapsible',
              label: 'My experience',
              fields: [
                headingField({ name: 'experienceHeading', label: 'Heading', lead: 'My', accent: 'experience' }),
                textarea('experienceIntro', 'Intro'),
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            text('contactKicker', 'Kicker', 'Start a project'),
            headingField({
              name: 'contactHeading',
              label: 'Heading',
              lead: 'Got an idea?\nLet\'s make it',
              accent: 'real.',
            }),
            textarea('contactSubtext', 'Subtext'),
            text('optionsLabel', 'Options label', 'What do you need?'),
            {
              type: 'row',
              fields: [
                text('nameLabel', 'Name field label', 'Your name'),
                text('emailLabel', 'Email field label', 'Your email'),
                text('messageLabel', 'Message field label', 'Tell me about your project'),
              ],
            },
            text('sendLabel', 'Send button', 'Send message'),
            textarea('formNote', 'Note under the form', {
              defaultValue: 'I usually reply within a day or two.',
              admin: { rows: 2 },
            }),
            textarea('successMessage', 'Success message', {
              defaultValue: "Thanks! Your message is on its way. I'll get back to you soon.",
              admin: { rows: 2 },
            }),
            textarea('errorMessage', 'Error message (invalid input)', {
              defaultValue: 'Add your name, a valid email and a short message, then send again.',
              admin: { rows: 2 },
            }),
            textarea('rateLimitMessage', 'Error message (too many messages)', {
              defaultValue: "You've sent a few messages already. Please try again in an hour.",
              admin: { rows: 2, description: 'Shown after 5 messages from the same visitor within an hour.' },
            }),
            textarea('sendErrorMessage', 'Error message (sending failed)', {
              defaultValue: 'Something went wrong while sending. Please try again, or email me directly.',
              admin: { rows: 2 },
            }),
            textarea('location', 'Location / availability card', { admin: { rows: 2 } }),
            {
              type: 'row',
              fields: [
                text('emailCardTitle', 'Email card title', 'Email'),
                text('copyEmailLabel', 'Copy button', 'Copy email'),
                text('copiedLabel', 'Copied text', 'Copied'),
                text('socialsTitle', 'Socials card title', 'Find me online'),
              ],
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            text('email', 'Email', undefined, { required: true }),
            {
              type: 'row',
              fields: [
                text('githubUrl', 'GitHub URL'),
                text('linkedinUrl', 'LinkedIn URL'),
              ],
            },
            text('ctaLabel', 'Header button', "Let's collab"),
            text('footerText', 'Footer text', undefined, {
              admin: { description: 'Use {year} for the current year.' },
            }),
          ],
        },
        {
          label: 'CV',
          fields: [
            {
              name: 'cv',
              label: 'CV (PDF)',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { equals: 'application/pdf' } },
              admin: { description: 'Upload a new PDF here to replace the download. Leave empty to hide the button.' },
            },
            text('cvLabel', 'Button label', 'Download CV'),
          ],
        },
        {
          label: 'Labels',
          description: 'Small interface texts. The defaults match the original site.',
          fields: [
            {
              type: 'collapsible',
              label: 'Menu',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    text('menuAbout', 'About', 'About'),
                    text('menuWork', 'Work', 'Work'),
                    text('menuToolkit', 'Toolkit', 'Toolkit'),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    text('menuProcess', 'How I build', 'How I Build'),
                    text('menuExperience', 'Experience', 'Experience'),
                    text('menuContact', 'Contact', "Let's Collab"),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    text('menuBlog', 'Blog', 'Blog'),
                    text('menuSayHi', '"Say hi" title', 'Say Hi'),
                    text('menuSocials', '"Socials" title', 'Socials'),
                  ],
                },
                text('vibesLabel', 'Vibe picker label', 'Pick a vibe'),
                text('vibeToast', 'Vibe switched message', 'Vibe switched to {vibe}', {
                  admin: { description: '{vibe} is replaced by the vibe name.' },
                }),
              ],
            },
            {
              type: 'collapsible',
              label: 'Hero & loader',
              admin: { initCollapsed: true },
              fields: [
                text('loaderLabel', 'Loader text', 'Loading the vibe'),
                {
                  type: 'row',
                  fields: [
                    text('gravityOn', 'Gravity button', 'Turn on gravity'),
                    text('gravityOnHint', 'Gravity hint', 'Then grab the letters and throw them'),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    text('gravityOff', 'Gravity button (on)', 'Put it back'),
                    text('gravityOffHint', 'Gravity hint (on)', 'Grab a letter and throw it'),
                  ],
                },
                text('scrollBadge', 'Scroll badge', 'SCROLL TO EXPLORE • SCROLL TO EXPLORE • '),
                text('sphereHint', 'Skill sphere hint', 'Drag to spin'),
                text('stepLabel', 'Process step label', 'Step {n} of {total}', {
                  admin: { description: '{n} and {total} are replaced by the step number and the number of steps.' },
                }),
                {
                  type: 'row',
                  fields: [
                    text('cursorOpen', 'Cursor on projects', 'Open'),
                    text('cursorDrag', 'Cursor on skill sphere', 'Drag'),
                    text('cursorThrow', 'Cursor on falling letters', 'Throw'),
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Footer',
              admin: { initCollapsed: true },
              fields: [
                text('backToTop', 'Back-to-top ring', 'BACK TO TOP • BEAM ME UP • BACK TO TOP • BEAM ME UP • '),
              ],
            },
          ],
        },
      ],
    },
  ],
}
