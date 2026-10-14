import { permanentRedirect } from 'next/navigation'

/**
 * Legacy misspelled route redirect.
 * Redirects permanent traffic to canonical `/administration`.
 */
export default function AdminstrationTypoRedirect() {
  permanentRedirect('/administration')
}
