'use server'

/**
 * @file actions/finances.actions.ts
 * @description Server Actions for financial management and staff attendance.
 *
 * Covers: Monthly electricity, helper boys CRUD + attendance,
 * doctor attendance, extra expenses CRUD, financial analytics.
 */

import { getAdminSupabase } from '@/lib/supabase'
import { requireAdmin } from '@/actions/auth.actions'
import { fetchServerFinancialAnalytics, fetchServerInventoryStats } from '@/lib/analytics'
import { updateTag } from 'next/cache'
import type { ActionResponse, AttendanceStatus } from '@/types/common.types'

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Resolves a branch identifier to a UUID.
 * Accepts both raw UUIDs and slug strings (e.g. "hazara").
 */
async function resolveBranchId(branchIdInput: string): Promise<string | null> {
  if (!branchIdInput?.trim()) return null

  const input = branchIdInput.trim()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)
  if (isUuid) return input

  const adminDb = getAdminSupabase()
  const { data: branch } = await adminDb
    .from('branches')
    .select('id')
    .eq('slug', input)
    .maybeSingle()

  return branch?.id || null
}

// ─── Electricity Bill ─────────────────────────────────────────────────────────

/**
 * Creates or updates the monthly electricity bill for a branch.
 * @param branchId - Branch UUID or slug
 * @param monthYear - Format: "YYYY-MM"
 * @param bill - Bill amount in INR
 */
export async function upsertMonthlyElectricity(
  branchId: string,
  monthYear: string,
  bill: number
): Promise<ActionResponse> {
  await requireAdmin()
  const sanitizedBranchId = await resolveBranchId(branchId)
  if (!sanitizedBranchId) {
    return { success: false, error: 'Invalid or missing branch identifier.' }
  }

  const adminDb = getAdminSupabase()
  try {
    const { data: existing } = await adminDb
      .from('monthly_expenses')
      .select('id')
      .eq('branch_id', sanitizedBranchId)
      .eq('month_year', monthYear)
      .maybeSingle()

    if (existing) {
      const { data, error } = await adminDb
        .from('monthly_expenses')
        .update({ electricity_bill: bill })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      updateTag('financial-analytics')
      return { success: true, data }
    } else {
      const { data, error } = await adminDb
        .from('monthly_expenses')
        .insert({ branch_id: sanitizedBranchId, month_year: monthYear, electricity_bill: bill })
        .select()
      if (error) throw error
      updateTag('financial-analytics')
      return { success: true, data }
    }
  } catch (err: any) {
    console.error('[Finances] Error updating electricity bill:', err)
    return { success: false, error: err.message || 'Failed to update electricity bill.' }
  }
}

// ─── Helper Boys CRUD ─────────────────────────────────────────────────────────

/**
 * Adds a new helper boy (support staff) record.
 */
export async function addHelperBoy(
  name: string,
  shift1Rate: number,
  shift2Rate: number,
  shift1Enabled: boolean,
  shift2Enabled: boolean,
  sundayEnabled: boolean,
  branchId: string
): Promise<ActionResponse> {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('helper_boys')
      .insert({
        name,
        shift_1_rate: shift1Rate,
        shift_2_rate: shift2Rate,
        shift_1_enabled: shift1Enabled,
        shift_2_enabled: shift2Enabled,
        sunday_enabled: sundayEnabled,
        branch_id: branchId,
      })
      .select()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error adding helper boy:', err)
    return { success: false, error: err.message || 'Failed to add helper boy.' }
  }
}

/**
 * Permanently deletes a helper boy record.
 */
export async function deleteHelperBoy(helperId: string): Promise<ActionResponse> {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb.from('helper_boys').delete().eq('id', helperId)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[Finances] Error deleting helper boy:', err)
    return { success: false, error: err.message || 'Failed to delete helper boy.' }
  }
}

// ─── Attendance ───────────────────────────────────────────────────────────────

/**
 * Upserts attendance for a helper boy on a specific date and shift.
 * @param helperBoyId - Helper boy UUID
 * @param date - ISO date string (YYYY-MM-DD)
 * @param shift - Shift number (1 or 2)
 * @param status - Attendance status
 */
export async function updateHelperAttendance(
  helperBoyId: string,
  date: string,
  shift: number,
  status: AttendanceStatus
): Promise<ActionResponse> {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('helper_attendance')
      .upsert(
        { helper_boy_id: helperBoyId, date, shift, status },
        { onConflict: 'helper_boy_id,date,shift' }
      )
      .select()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error updating helper attendance:', err)
    return { success: false, error: err.message || 'Failed to update helper attendance.' }
  }
}

/**
 * Upserts attendance for a doctor on a specific date.
 * @param doctorId - Doctor UUID
 * @param date - ISO date string (YYYY-MM-DD)
 * @param status - Attendance status
 */
export async function updateDoctorAttendance(
  doctorId: string,
  date: string,
  status: AttendanceStatus
): Promise<ActionResponse> {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('doctor_attendance')
      .upsert(
        { doctor_id: doctorId, date, status },
        { onConflict: 'doctor_id,date' }
      )
      .select()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error updating doctor attendance:', err)
    return { success: false, error: err.message || 'Failed to update doctor attendance.' }
  }
}

// ─── Extra Expenses ───────────────────────────────────────────────────────────

/**
 * Adds a one-off extra expense record for a branch.
 * Note field is required for audit trail purposes.
 */
export async function addExtraExpense(
  amount: number,
  note: string,
  date: string,
  branchId: string
): Promise<ActionResponse> {
  await requireAdmin()
  if (!note || note.trim() === '') {
    return { success: false, error: 'A description/note is compulsory for extra expenses.' }
  }

  const adminDb = getAdminSupabase()
  const sanitizedBranchId = await resolveBranchId(branchId)

  try {
    const { data, error } = await adminDb
      .from('extra_expenses')
      .insert({ amount, note: note.trim(), expense_date: date, branch_id: sanitizedBranchId })
      .select()
    if (error) throw error
    updateTag('financial-analytics')
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error adding extra expense:', err)
    return { success: false, error: err.message || 'Failed to add extra expense.' }
  }
}

/**
 * Updates an existing extra expense record.
 */
export async function updateExtraExpense(
  id: string,
  amount: number,
  note: string,
  date: string,
  branchId: string
): Promise<ActionResponse> {
  await requireAdmin()
  if (!note || note.trim() === '') {
    return { success: false, error: 'A description/note is compulsory for extra expenses.' }
  }

  const adminDb = getAdminSupabase()
  const sanitizedBranchId = await resolveBranchId(branchId)

  try {
    const { data, error } = await adminDb
      .from('extra_expenses')
      .update({ amount, note: note.trim(), expense_date: date, branch_id: sanitizedBranchId })
      .eq('id', id)
      .select()
    if (error) throw error
    updateTag('financial-analytics')
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error updating extra expense:', err)
    return { success: false, error: err.message || 'Failed to update extra expense.' }
  }
}

/**
 * Deletes an extra expense record.
 */
export async function deleteExtraExpense(id: string): Promise<ActionResponse> {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb.from('extra_expenses').delete().eq('id', id)
    if (error) throw error
    updateTag('financial-analytics')
    return { success: true }
  } catch (err: any) {
    console.error('[Finances] Error deleting extra expense:', err)
    return { success: false, error: err.message || 'Failed to delete extra expense.' }
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

/**
 * Fetches server-computed financial analytics for a branch and year.
 * @param selectedBranch - Branch slug or "all" for combined analytics
 * @param selectedYear - 4-digit year (defaults to current year)
 */
export async function getFinancialAnalyticsAction(
  selectedBranch: string = 'all',
  selectedYear: number = new Date().getFullYear()
): Promise<ActionResponse> {
  await requireAdmin()
  try {
    const data = await fetchServerFinancialAnalytics(selectedBranch, selectedYear)
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error fetching financial analytics:', err)
    return { success: false, error: err.message || 'Failed to compute financial analytics.' }
  }
}

/**
 * Fetches server-computed inventory statistics for a branch.
 */
export async function getInventoryStatsAction(
  branchSlug: string = 'hazara'
): Promise<ActionResponse> {
  await requireAdmin()
  try {
    const data = await fetchServerInventoryStats(branchSlug)
    return { success: true, data }
  } catch (err: any) {
    console.error('[Finances] Error fetching inventory stats:', err)
    return { success: false, error: err.message || 'Failed to compute inventory stats.' }
  }
}
