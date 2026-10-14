'use server'

/**
 * @file actions/doctors.actions.ts
 * @description Server Actions for doctor CRUD operations.
 *
 * Covers: Add, Update, Delete doctors and their profile images.
 * All operations require admin Supabase client (service role).
 */

import { getAdminSupabase } from '@/lib/supabase'
import type { ActionResponse } from '@/types/common.types'

// ─── Helper: Save profile image to Supabase Storage ──────────────────────────

/**
 * Uploads a file to the "reports" Supabase storage bucket.
 * Auto-creates the bucket if missing.
 * @returns Public URL of the uploaded file
 */
async function saveProfileImage(file: File): Promise<string> {
  const adminDb = getAdminSupabase()

  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('No valid file received by the server.')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const uniqueFileName = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`

  let uploadRes = await adminDb.storage
    .from('reports')
    .upload(uniqueFileName, buffer, { contentType: file.type, upsert: true })

  if (uploadRes.error?.message?.toLowerCase().includes('bucket not found')) {
    console.log('[Storage] Creating "reports" bucket dynamically...')
    const { error: createErr } = await adminDb.storage.createBucket('reports', { public: true })
    if (createErr) throw new Error(`Failed to create storage bucket: ${createErr.message}`)
    uploadRes = await adminDb.storage
      .from('reports')
      .upload(uniqueFileName, buffer, { contentType: file.type, upsert: true })
  }

  if (uploadRes.error) throw uploadRes.error

  const { data: urlData } = adminDb.storage.from('reports').getPublicUrl(uniqueFileName)
  return urlData.publicUrl
}

// ─── Add Doctor ───────────────────────────────────────────────────────────────

/**
 * Creates a new doctor record in Supabase.
 * Accepts a FormData payload from the admin doctor creation form.
 */
export async function addDoctor(formData: FormData): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()

  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const specialty = formData.get('specialty') as string
  const branchId = formData.get('branch_id') as string
  const imageFile = formData.get('picture') as File | null
  const compensationType = (formData.get('compensation_type') as string) || 'fixed'
  const fixedSalary = parseFloat(formData.get('fixed_salary') as string || '0')
  const profitPercentage = parseFloat(formData.get('profit_percentage') as string || '0')
  const profitSharingTarget = (formData.get('profit_sharing_target') as string) || 'both'
  const password = (formData.get('password') as string)?.trim() || 'doctor123'

  if (!name || !email) {
    return { success: false, error: 'Doctor name and email are required.' }
  }

  const slug =
    ((formData.get('slug') as string) ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) ||
    `doc-${Date.now()}`

  const phone = (formData.get('phone') as string) || null

  try {
    let pictureUrl = ''
    if (imageFile && imageFile.size > 0) {
      pictureUrl = await saveProfileImage(imageFile)
    }

    const { data, error } = await adminDb
      .from('doctors')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone ? phone.trim() : null,
        specialty: specialty || null,
        branch_id: branchId || null,
        picture_url: pictureUrl || null,
        compensation_type: compensationType,
        fixed_salary: fixedSalary,
        profit_percentage: profitPercentage,
        profit_sharing_target: profitSharingTarget,
        password,
        slug,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Doctors] Error adding doctor:', err)
    return { success: false, error: err.message || 'Failed to create doctor record.' }
  }
}

// ─── Update Doctor ────────────────────────────────────────────────────────────

/**
 * Updates an existing doctor record. Only updates the profile image
 * if a new file is provided; otherwise retains the existing URL.
 */
export async function updateDoctor(formData: FormData): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()

  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const specialty = formData.get('specialty') as string
  const branchId = formData.get('branch_id') as string
  const imageFile = formData.get('picture') as File | null
  const currentPictureUrl = formData.get('current_picture_url') as string
  const compensationType = (formData.get('compensation_type') as string) || 'fixed'
  const fixedSalary = parseFloat(formData.get('fixed_salary') as string || '0')
  const profitPercentage = parseFloat(formData.get('profit_percentage') as string || '0')
  const profitSharingTarget = (formData.get('profit_sharing_target') as string) || 'both'
  const passwordInput = (formData.get('password') as string)?.trim()

  if (!id) return { success: false, error: 'Doctor ID is required for update.' }
  if (!name || !email) {
    return { success: false, error: 'Doctor name and email are required.' }
  }

  const slug =
    ((formData.get('slug') as string) ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) ||
    `doc-${Date.now()}`

  const phone = (formData.get('phone') as string) || null

  try {
    let pictureUrl = currentPictureUrl
    if (imageFile && imageFile.size > 0) {
      pictureUrl = await saveProfileImage(imageFile)
    }

    const updatePayload: Record<string, any> = {
      name,
      email: email.toLowerCase(),
      phone: phone ? phone.trim() : null,
      specialty: specialty || null,
      branch_id: branchId || null,
      picture_url: pictureUrl || null,
      compensation_type: compensationType,
      fixed_salary: fixedSalary,
      profit_percentage: profitPercentage,
      profit_sharing_target: profitSharingTarget,
      slug,
    }

    // Only update password if explicitly provided by admin; do not overwrite with fallback
    if (passwordInput) {
      updatePayload.password = passwordInput
    }

    const { data, error } = await adminDb
      .from('doctors')
      .update(updatePayload)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Doctors] Error updating doctor:', err)
    return { success: false, error: err.message || 'Failed to update doctor record.' }
  }
}

// ─── Delete Doctor ────────────────────────────────────────────────────────────

/**
 * Permanently deletes a doctor record from Supabase.
 * @param id - UUID of the doctor to delete
 */
export async function deleteDoctor(id: string): Promise<ActionResponse> {
  if (!id) return { success: false, error: 'Doctor ID is required.' }

  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb.from('doctors').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[Doctors] Error deleting doctor:', err)
    return { success: false, error: err.message || 'Failed to delete doctor.' }
  }
}
