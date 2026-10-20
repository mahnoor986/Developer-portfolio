import { z } from 'zod'

/** Hidden input that people never see; bots that fill every field give themselves away. */
export const HONEYPOT_FIELD = 'company'

/** Shared by the contact form (client-side hints) and the Server Action (the real check). */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .refine((v) => !/[<>]/.test(v)),
  email: z.string().trim().max(254).pipe(z.email()),
  message: z.string().trim().min(1).max(5000),
  projectType: z.string().trim().max(120).optional().default(''),
  pageUrl: z.string().trim().max(500).optional().default(''),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactField = 'name' | 'email' | 'message'

export type SendMessageResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; fields: ContactField[] }
  | { ok: false; reason: 'rate-limited' | 'error' | 'delivery-error' }
