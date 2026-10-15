import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** Leaves draft mode and goes back to the published site. */
export async function GET() {
  ;(await draftMode()).disable()
  redirect('/')
}
