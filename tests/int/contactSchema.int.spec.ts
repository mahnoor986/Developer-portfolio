import { describe, expect, it } from 'vitest'

import { contactSchema } from '@/lib/contactSchema'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello!' }
const fails = (input: Record<string, unknown>) => !contactSchema.safeParse({ ...valid, ...input }).success

describe('contact form validation', () => {
  it('accepts a normal message and trims it', () => {
    const r = contactSchema.parse({ ...valid, name: '  Ada  ', message: ' Hi ' })
    expect(r.name).toBe('Ada')
    expect(r.message).toBe('Hi')
  })

  it('rejects empty or too long names, and names with < or >', () => {
    expect(fails({ name: '   ' })).toBe(true)
    expect(fails({ name: 'a'.repeat(121) })).toBe(true)
    expect(fails({ name: 'a'.repeat(120) })).toBe(false)
    expect(fails({ name: '<script>' })).toBe(true)
    expect(fails({ name: 'a > b' })).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(fails({ email: 'not-an-email' })).toBe(true)
    expect(fails({ email: 'a@b' })).toBe(true)
    expect(fails({ email: '' })).toBe(true)
  })

  it('requires a message of 1 to 5000 characters', () => {
    expect(fails({ message: '' })).toBe(true)
    expect(fails({ message: 'x'.repeat(5001) })).toBe(true)
    expect(fails({ message: 'x'.repeat(5000) })).toBe(false)
  })
})
