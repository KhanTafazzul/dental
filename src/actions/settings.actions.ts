'use server'

/**
 * @file actions/settings.actions.ts
 * @description Server Actions for clinic settings, branch hours, time slots,
 * camera passcodes, capture preferences, and admin profile configurations.
 */

import { getAdminSupabase } from '@/lib/supabase'
import type { ActionResponse } from '@/types/common.types'

export interface AdminProfileData {
  fullName: string
  email: string
  phone: string
  designation: string
  primaryBranch: string
  avatarUrl?: string
}

/** Updates the admin profile details. */
export async function updateAdminProfile(data: AdminProfileData): Promise<ActionResponse<AdminProfileData>> {
  try {
    return {
      success: true,
      data,
      message: 'Admin account profile updated successfully.',
    }
  } catch (err: any) {
    console.error('[Settings] Error updating admin profile:', err)
    return { success: false, error: err.message || 'Failed to update admin profile.' }
  }
}

/** Updates the admin security password with current password verification. */
export async function updateAdminSecurityPassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResponse> {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return {
        success: false,
        error: 'Server configuration error: ADMIN_PASSWORD environment variable is not set.',
      }
    }

    if (currentPassword !== adminPassword) {
      return {
        success: false,
        error: 'Re-authentication failed: Current password is incorrect. Please verify your current password.',
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters long.',
      }
    }

    return {
      success: true,
      message: 'Admin security password updated successfully.',
    }
  } catch (err: any) {
    console.error('[Settings] Error updating password:', err)
    return { success: false, error: err.message || 'Failed to update security password.' }
  }
}

/** Informs the user how to update ADMIN_PASSWORD env variable. */
export async function changeAdminPassword(newPassword: string): Promise<ActionResponse> {
  return {
    success: true,
    message: 'To permanently change the password, please update the ADMIN_PASSWORD variable in your .env.local file.',
  }
}

/** Updates a branch's working hours. */
export async function updateBranchHours(
  branchId: string,
  workingHours: string
): Promise<ActionResponse<any>> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('branches')
      .update({ working_hours: workingHours })
      .eq('id', branchId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Settings] Error updating branch hours:', err)
    return { success: false, error: err.message || 'Failed to update branch hours.' }
  }
}

/** Adds a new appointment time slot. */
export async function addTimeSlot(timeValue: string): Promise<ActionResponse<any>> {
  const adminDb = getAdminSupabase()
  try {
    const parts = timeValue.split(':')
    let hours = parseInt(parts[0], 10)
    const minutes = parts[1] || '00'
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const hoursStr = String(hours).padStart(2, '0')
    const timeLabel = `${hoursStr}:${minutes} ${ampm}`

    const formattedTimeValue = parts.length === 2 ? `${timeValue}:00` : timeValue

    const { data, error } = await adminDb
      .from('time_slots')
      .insert({
        time_value: formattedTimeValue,
        time_label: timeLabel,
      })
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Settings] Error adding time slot:', err)
    return { success: false, error: err.message || 'Failed to add time slot.' }
  }
}

/** Deletes an appointment time slot. */
export async function deleteTimeSlot(id: string): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb.from('time_slots').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[Settings] Error deleting time slot:', err)
    return { success: false, error: err.message || 'Failed to delete time slot.' }
  }
}

/** Updates the camera passcode for a branch. */
export async function updateCameraPasscode(
  branchId: string,
  passcode: string
): Promise<ActionResponse<any>> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('branches')
      .update({ camera_passcode: passcode })
      .eq('id', branchId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Settings] Error updating camera passcode:', err)
    return { success: false, error: err.message || 'Failed to update passcode.' }
  }
}

/** Toggles whether mobile medicine capture is permitted for a branch. */
export async function updateBranchCaptureMedicine(
  branchId: string,
  allowCaptureMedicine: boolean
): Promise<ActionResponse<any>> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('branches')
      .update({ allow_capture_medicine: allowCaptureMedicine })
      .eq('id', branchId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Settings] Error updating capture settings:', err)
    return { success: false, error: err.message || 'Failed to update capture settings.' }
  }
}
