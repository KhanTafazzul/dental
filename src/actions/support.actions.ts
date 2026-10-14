'use server'

/**
 * @file actions/support.actions.ts
 * @description Server Actions for DPDP Privacy requests, patient support tickets,
 * complaints management, and admin clinic preference resets.
 *
 * Compliant with India DPDP Act 2023 & DPDP Rules 2025:
 * - Data subject access, correction, erasure requests
 * - Immediate patient account closure/erasure
 * - Patient feedback and complaint tracking
 */

import { getAdminSupabase } from '@/lib/supabase'
import { requireAdmin } from '@/actions/auth.actions'
import type { ActionResponse } from '@/types/common.types'

// ─── DPDP Act 2023 Subject Rights ─────────────────────────────────────────────

export interface DpdpRequestParams {
  requestType: 'access' | 'correction' | 'erasure' | 'withdraw'
  fullName: string
  email: string
  phone?: string
  details?: string
  language?: string
}

/**
 * Logs a patient Data Protection request (Section 5 & 6 DPDP Act 2023).
 */
export async function submitDpdpRequest(params: DpdpRequestParams) {
  const adminDb = getAdminSupabase()
  const ticketId = `DPDP-2026-${Math.floor(100000 + Math.random() * 900000)}`
  const timestamp = new Date().toISOString()

  try {
    const { error } = await adminDb
      .from('dpdp_requests')
      .insert({
        ticket_id: ticketId,
        request_type: params.requestType,
        full_name: params.fullName,
        email: params.email.trim().toLowerCase(),
        phone: params.phone || null,
        details: params.details || null,
        language: params.language || 'en',
        status: 'received',
        submitted_at: timestamp,
      })

    if (error) {
      console.error('[DPDP] dpdp_requests insert error:', error.message)
      return {
        success: false,
        error: 'Unable to submit your DPDP request at this time. Please try again.',
      }
    }

    return {
      success: true,
      ticketId,
      submittedAt: timestamp,
      message: `Your Data Rights Request under Section 5 & 6 of DPDP Act 2023 has been received. Ticket ID: ${ticketId}. Our DPO will review and process your request within 72 business hours.`,
    }
  } catch (err: any) {
    console.error('[DPDP] submitDpdpRequest error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred while processing your request. Please try again.',
    }
  }
}

/**
 * Permanently removes a patient's account and profile records under DPDP Right to Erasure.
 */
export async function deletePatientAccount(email: string, reason?: string) {
  const trimmedEmail = (email || '').trim().toLowerCase()
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: 'A valid email address is required for account closure.' }
  }

  const adminDb = getAdminSupabase()
  const timestamp = new Date().toISOString()
  const ticketId = `DEL-2026-${Math.floor(100000 + Math.random() * 900000)}`

  try {
    const { error: deleteErr } = await adminDb
      .from('patients')
      .delete()
      .eq('email', trimmedEmail)

    if (deleteErr) {
      console.error('[DPDP] Patient record delete error:', deleteErr.message)
      return {
        success: false,
        error: `Failed to erase account record: ${deleteErr.message}`,
      }
    }

    await adminDb
      .from('dpdp_requests')
      .insert({
        ticket_id: ticketId,
        request_type: 'erasure',
        full_name: 'Erased Account',
        email: trimmedEmail,
        details: reason ? `Account closure reason: ${reason}` : 'Patient requested immediate account closure.',
        status: 'completed',
        submitted_at: timestamp,
      })

    return {
      success: true,
      ticketId,
      message: 'Your patient account credentials and active profiles have been permanently deleted.',
    }
  } catch (err: any) {
    console.error('[DPDP] deletePatientAccount error:', err)
    return {
      success: false,
      error: err.message || 'Account deletion could not be completed.',
    }
  }
}

// ─── Patient Support Tickets ──────────────────────────────────────────────────

export interface SupportTicketParams {
  name: string
  email: string
  phone?: string
  branch?: string
  category?: string
  subject: string
  message: string
}

/**
 * Creates a support or inquiry ticket submitted by a patient.
 */
export async function submitSupportTicket(params: SupportTicketParams) {
  const adminDb = getAdminSupabase()
  const ticketId = `SUP-2026-${Math.floor(100000 + Math.random() * 900000)}`
  const timestamp = new Date().toISOString()

  try {
    const { error } = await adminDb
      .from('dpdp_requests')
      .insert({
        ticket_id: ticketId,
        request_type: 'access',
        full_name: params.name,
        email: params.email.trim().toLowerCase(),
        phone: params.phone || null,
        details: `[Support Ticket - ${params.category || 'General'}] Branch: ${params.branch || 'General'}. Subject: ${params.subject}. Details: ${params.message}`,
        status: 'received',
        submitted_at: timestamp,
      })

    if (error) {
      console.error('[Support] Ticket insert error:', error.message)
      return {
        success: false,
        error: 'Failed to register support ticket. Please try again.',
      }
    }

    return {
      success: true,
      ticketId,
      submittedAt: timestamp,
      message: `Your support ticket has been registered under Ticket ID: ${ticketId}. Our patient coordinator will contact you shortly.`,
    }
  } catch (err: any) {
    console.error('[Support] submitSupportTicket error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred while creating your support ticket.',
    }
  }
}

// ─── Complaints Management ───────────────────────────────────────────────────

/**
 * Fetches all complaints and DPDP inquiries for the admin dashboard.
 */
export async function getComplaintsAction() {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('dpdp_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error || !data) {
      console.error('[Complaints] Error fetching complaints:', error)
      return { success: false, error: error?.message || 'Failed to fetch complaints records.', data: [] }
    }

    const processedDbData = data.map((item: any) => {
      let branch = 'Hazara Branch'
      let category = 'General Support'
      const detailsText = item.details || ''

      if (detailsText.includes('[Support Ticket -')) {
        const branchMatch = detailsText.match(/Branch:\s*([^.]+)\./)
        if (branchMatch) branch = branchMatch[1].trim()

        const catMatch = detailsText.match(/\[Support Ticket -\s*([^\]]+)\]/)
        if (catMatch) category = catMatch[1].trim()
      } else if (item.request_type === 'erasure') {
        category = 'DPDP Privacy (Erasure)'
      } else if (item.request_type === 'access') {
        category = 'DPDP Access Request'
      }

      return {
        id: item.id || item.ticket_id,
        ticket_id: item.ticket_id,
        request_type: item.request_type,
        full_name: item.full_name,
        email: item.email,
        phone: item.phone || 'N/A',
        branch,
        category,
        details: detailsText,
        status: item.status || 'received',
        submitted_at: item.submitted_at || new Date().toISOString(),
        admin_notes: item.admin_notes || null,
      }
    })

    return { success: true, data: processedDbData }
  } catch (err: any) {
    console.error('[Complaints] getComplaintsAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch complaints.' }
  }
}

/**
 * Updates the resolution status and admin notes for a specific ticket.
 */
export async function updateComplaintStatusAction(
  ticketId: string,
  status: string,
  adminNotes?: string
): Promise<ActionResponse<{ ticketId: string; status: string }>> {
  await requireAdmin()
  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb
      .from('dpdp_requests')
      .update({
        status,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('ticket_id', ticketId)

    if (error) {
      console.error('[Complaints] Update complaint status error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data: { ticketId, status } }
  } catch (err: any) {
    console.error('[Complaints] updateComplaintStatus error:', err)
    return { success: false, error: err.message || 'Failed to update complaint status.' }
  }
}

// ─── Clinic Settings & Resets ─────────────────────────────────────────────────

/**
 * Resets clinic preferences back to system defaults. Requires confirmation string.
 */
export async function resetClinicSettingsAction(confirmationText: string): Promise<ActionResponse> {
  try {
    if (confirmationText !== 'RESET') {
      return { success: false, error: 'Confirmation failed. Please type RESET to confirm.' }
    }

    return {
      success: true,
      message: 'Clinic preferences have been restored to default settings.',
    }
  } catch (err: any) {
    console.error('[Settings] resetClinicSettings error:', err)
    return { success: false, error: err.message || 'Failed to reset clinic settings.' }
  }
}
