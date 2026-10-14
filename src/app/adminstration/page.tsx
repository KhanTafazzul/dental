import { redirect } from 'next/navigation'

/**
 * Legacy misspelled route redirect.
 * Redirects permanent traffic to canonical `/administration`.
 */
export default function AdminstrationTypoRedirect() {
  redirect('/administration')
}
