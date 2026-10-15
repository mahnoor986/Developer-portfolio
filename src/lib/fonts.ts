import { Instrument_Sans, Space_Grotesk, Syne, Unbounded } from 'next/font/google'

/** The four portfolio fonts, shared by the public site and the admin (exposed as CSS variables). */
export const syne = Syne({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-syne', display: 'swap' })
export const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
})
export const unbounded = Unbounded({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-unbounded', display: 'swap' })
export const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
})

export const fontVariables = [syne.variable, instrument.variable, unbounded.variable, grotesk.variable].join(' ')
