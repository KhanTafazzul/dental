import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines Tailwind classes conditionally and resolves collisions.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric amount as Indian Rupee currency (₹).
 * @example formatINR(1450) => "₹1,450"
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount == null || isNaN(Number(amount))) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

/**
 * Formats a Date or date string to a human-readable display string.
 * @example formatDate("2026-10-14") => "14 Oct 2026"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  let d: Date
  if (typeof date === 'string') {
    // If format is YYYY-MM-DD, parse as calendar date to avoid UTC midnight timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number)
      d = new Date(year, month - 1, day)
    } else {
      d = new Date(date)
    }
  } else {
    d = date
  }

  if (isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formats time string (HH:MM or HH:MM:SS) to 12-hour AM/PM format.
 * @example formatTime("14:30") => "02:30 PM"
 */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '—'
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}

/**
 * Extracts initials from a person's full name.
 * @example getInitials("Nadeem Hazara") => "NH"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '—'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '')
    .join('')
}

/**
 * Cleans phone number to numeric digits only and ensures 91 country code prefix.
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.length === 10) digits = `91${digits}`
  return digits
}

/**
 * Truncates text to max length with ellipsis.
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}
