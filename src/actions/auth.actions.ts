'use server'

/**
 * @file actions/auth.actions.ts
 * @description Server Actions for admin & doctor authentication.
 *
 * Covers: Admin login/logout, Doctor login (by slug + universal), Doctor logout.
 * All tokens are HMAC-signed and stored as httpOnly cookies.
 */

import { cookies } from 'next/headers'
import { signToken, verifyToken } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { COOKIES } from '@/constants/routes'
import type { ActionResponse } from '@/types/common.types'

// ─── Session Verification Helpers ─────────────────────────────────────────────

/**
 * Verifies whether the active request has a valid admin session cookie.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIES.ADMIN_TOKEN)?.value
    const val = await verifyToken(token)
    return val === 'admin'
  } catch {
    return false
  }
}

/**
 * Verifies whether the active request has a valid doctor session cookie.
 */
export async function verifyDoctorSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIES.DOCTOR_TOKEN)?.value
    return await verifyToken(token)
  } catch {
    return null
  }
}

/**
 * Enforces admin authorization for Server Actions. Throws an Error if unauthorized.
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin privilege required.')
  }
}

/**
 * Enforces admin or doctor authorization.
 */
export async function requireAdminOrDoctor(): Promise<{ role: 'admin' | 'doctor'; doctorSlug?: string }> {
  if (await verifyAdminSession()) {
    return { role: 'admin' }
  }
  const doctorSlug = await verifyDoctorSession()
  if (doctorSlug) {
    return { role: 'doctor', doctorSlug }
  }
  throw new Error('Unauthorized: Clinic staff authorization required.')
}


// ─── Admin Auth ───────────────────────────────────────────────────────────────

/**
 * Authenticates the admin using the ADMIN_PASSWORD environment variable.
 * Sets a signed httpOnly cookie on success.
 */
export async function loginAdmin(password: string): Promise<ActionResponse> {
  const adminPassword = process.env.ADMIN_PASSWORD || ''

  if (!adminPassword) {
    console.error('[Auth] ADMIN_PASSWORD environment variable is not configured.')
    return { success: false, error: 'Server configuration error. Contact administrator.' }
  }

  if (password === adminPassword) {
    try {
      const cookieStore = await cookies()
      const tokenValue = await signToken('admin')
      cookieStore.set(COOKIES.ADMIN_TOKEN, tokenValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      return { success: true }
    } catch (err: any) {
      console.error('[Auth] Failed to set admin cookie:', err)
      return { success: false, error: 'Authentication failed. Please try again.' }
    }
  }

  return { success: false, error: 'Incorrect password credentials.' }
}

/**
 * Destroys the admin session cookie, logging the admin out.
 */
export async function logoutAdmin(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIES.ADMIN_TOKEN)
    return { success: true }
  } catch (err: any) {
    console.error('[Auth] Failed to clear admin cookie:', err)
    return { success: false, error: 'Logout failed. Please try again.' }
  }
}

// ─── Doctor Auth ──────────────────────────────────────────────────────────────

/**
 * Authenticates a doctor by their unique slug.
 * @param slug - Doctor's URL slug (e.g. "dr-nadeem")
 * @param password - Plain-text password to compare
 */
export async function loginDoctor(slug: string, password: string): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { data: doctor, error } = await adminDb
      .from('doctors')
      .select('id, password, slug')
      .eq('slug', slug)
      .single()

    if (error || !doctor) {
      return { success: false, error: 'Doctor record not found.' }
    }

    if (doctor.password === password) {
      const cookieStore = await cookies()
      const signedToken = await signToken(doctor.slug)
      cookieStore.set(COOKIES.DOCTOR_TOKEN, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      return { success: true }
    }

    return { success: false, error: 'Incorrect password.' }
  } catch (err: any) {
    console.error('[Auth] Doctor login error:', err)
    return { success: false, error: err.message || 'Login failed.' }
  }
}

/**
 * Authenticates a doctor by name, email, or slug — useful for universal login page.
 * @param identifier - Can be a slug, email, or name fragment
 * @param password - Plain-text password to compare
 */
export async function loginDoctorUniversal(
  identifier: string,
  password: string
): Promise<ActionResponse<{ slug: string; name: string }>> {
  const adminDb = getAdminSupabase()
  try {
    const trimmed = identifier.trim()
    const sanitized = trimmed.replace(/[,()]/g, '')
    if (!sanitized) {
      return { success: false, error: 'Please enter a valid Name or Email.' }
    }

    const { data: doctors, error } = await adminDb
      .from('doctors')
      .select('id, name, slug, email, password')
      .or(`slug.eq.${sanitized.toLowerCase()},email.ilike.${sanitized},name.ilike.%${sanitized}%`)

    if (error || !doctors || doctors.length === 0) {
      return { success: false, error: 'No doctor found with that Name or Email.' }
    }

    const doctor = doctors[0]

    if (doctor.password === password) {
      const cookieStore = await cookies()
      const signedToken = await signToken(doctor.slug)
      cookieStore.set(COOKIES.DOCTOR_TOKEN, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return { success: true, data: { slug: doctor.slug, name: doctor.name } }
    }

    return { success: false, error: 'Incorrect security password.' }
  } catch (err: any) {
    console.error('[Auth] Universal doctor login error:', err)
    return { success: false, error: err.message || 'Login failed.' }
  }
}

/**
 * Destroys the doctor session cookie.
 */
export async function logoutDoctor(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIES.DOCTOR_TOKEN)
    return { success: true }
  } catch (err: any) {
    console.error('[Auth] Failed to clear doctor cookie:', err)
    return { success: false, error: 'Logout failed.' }
  }
}
