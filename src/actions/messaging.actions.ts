'use server'

/**
 * @file actions/messaging.actions.ts
 * @description Server Actions for communication, notifications, emails, and WhatsApp.
 *
 * Covers:
 * - Re-exported Patient report dispatch & doctor appointment email notifications
 * - Broadcast campaigns to patients
 * - Automated same-day appointment reminders
 * - Automated birthday wishes
 * - Message audit logs retrieval
 * - Doctor morning schedule digest
 * - WAHA WhatsApp engine testing and status checks
 */

import { getAdminSupabase } from '@/lib/supabase'
import { sendNotification } from '@/lib/messaging'
import {
  sendWahaTextMessage,
  sendDailyDoctorAppointmentDigest,
  checkWahaHealth,
  DEFAULT_TARGET_TEST_NUMBER,
} from '@/lib/waha'
import type { ActionResponse } from '@/types/common.types'

// ─── Campaigns & Broadcasts ───────────────────────────────────────────────────

/**
 * Dispatches a broadcast notification to all registered patients.
 */
export async function sendBroadcastCampaignAction(
  targetBranch: string,
  messageBody: string,
  attachmentUrl?: string
): Promise<ActionResponse<{ count: number }>> {
  const adminDb = getAdminSupabase()
  try {
    const { data: patients, error } = await adminDb.from('patients').select('*')
    if (error) throw error

    let count = 0
    if (patients && patients.length > 0) {
      for (const p of patients) {
        await sendNotification({
          recipientName: p.name || 'Patient',
          recipientPhone: p.mobile,
          recipientEmail: p.email,
          subject: 'Special Update - Dental Clinic',
          messageBody: `Hello ${p.name || 'Patient'},\n\n${messageBody}`,
          attachmentUrl: attachmentUrl || undefined,
          type: 'broadcast_campaign',
        })
        count++
      }
    }

    return { success: true, data: { count } }
  } catch (err: any) {
    console.error('[Messaging] sendBroadcastCampaign error:', err)
    return { success: false, error: err.message || 'Failed to send campaign broadcast.' }
  }
}

/**
 * Triggers reminder notifications for all appointments scheduled for today.
 */
export async function triggerSameDayRemindersAction(): Promise<ActionResponse<{ count: number }>> {
  const adminDb = getAdminSupabase()
  const today = new Date().toISOString().split('T')[0]
  try {
    const { data: appointments, error } = await adminDb
      .from('appointments')
      .select('*, patients(*), doctors(*), branches(*)')
      .eq('appointment_date', today)

    if (error) throw error

    let count = 0
    if (appointments && appointments.length > 0) {
      for (const appt of appointments) {
        const p = appt.patients
        const d = appt.doctors
        const b = appt.branches
        if (p) {
          await sendNotification({
            recipientName: p.name || 'Patient',
            recipientPhone: p.mobile,
            recipientEmail: p.email,
            subject: 'Appointment Today Reminder - Dental Clinic',
            messageBody: `Reminder: Hello ${p.name}, you have a dental appointment scheduled TODAY (${today}) at ${appt.appointment_time} with Dr. ${d?.name || 'Doctor'} at ${b?.name || 'our clinic'}. See you soon!`,
            type: 'appointment_reminder',
          })
          count++
        }
      }
    }

    return { success: true, data: { count } }
  } catch (err: any) {
    console.error('[Messaging] triggerSameDayReminders error:', err)
    return { success: false, error: err.message || 'Failed to trigger reminders.' }
  }
}

/**
 * Sends automated birthday congratulations to patients born on today's date.
 */
export async function triggerBirthdayWishesAction(): Promise<ActionResponse<{ count: number }>> {
  const adminDb = getAdminSupabase()
  try {
    const { data: patients, error } = await adminDb.from('patients').select('*')
    if (error) throw error

    const today = new Date()
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    let count = 0
    if (patients && patients.length > 0) {
      for (const p of patients) {
        if (p.dob && String(p.dob).endsWith(currentMonthDay)) {
          await sendNotification({
            recipientName: p.name || 'Patient',
            recipientPhone: p.mobile,
            subject: 'Birthday Greetings from Hazara & Family Dental Clinics',
            messageBody: `Dear ${p.name},\n\nWe extend our warmest wishes on your birthday for continued health, wellness, and happiness. Warm regards from the healthcare team at Hazara & Family Dental Clinics.`,
            type: 'birthday_wish',
          })
          count++
        }
      }
    }

    return { success: true, data: { count } }
  } catch (err: any) {
    console.error('[Messaging] triggerBirthdayWishes error:', err)
    return { success: false, error: err.message || 'Failed to trigger birthday wishes.' }
  }
}

/**
 * Fetches recent message audit logs from the database.
 */
export async function getMessageLogsAction(): Promise<ActionResponse<any[]>> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('message_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      return { success: true, data: [] }
    }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('[Messaging] getMessageLogs error:', err)
    return { success: true, data: [] }
  }
}

// ─── WAHA WhatsApp Engine Integration ─────────────────────────────────────────

/**
 * Triggers the automated daily appointment schedule digest sent to all doctors.
 */
export async function triggerDoctorMorningDigestAction() {
  try {
    const result = await sendDailyDoctorAppointmentDigest()
    return result
  } catch (err: any) {
    console.error('[Messaging] morning digest error:', err)
    return { success: false, count: 0, sentDoctors: [], details: [{ error: err.message }] }
  }
}

/**
 * Dispatches a test WhatsApp message using the WAHA engine.
 */
export async function testWahaWhatsAppAction(
  phone: string = DEFAULT_TARGET_TEST_NUMBER,
  text: string = ''
) {
  try {
    const sampleMsg = text || `[SYSTEM TEST] Testing WAHA WhatsApp GOWS engine integration.\nTarget: ${phone}`
    const result = await sendWahaTextMessage({ phone, text: sampleMsg })
    return result
  } catch (err: any) {
    console.error('[Messaging] testWahaWhatsApp error:', err)
    return { success: false, error: err.message || 'Failed to send WhatsApp message via WAHA' }
  }
}

/**
 * Queries the current operational health of the WAHA WhatsApp session.
 */
export async function getWahaStatusAction() {
  try {
    const health = await checkWahaHealth()
    return health
  } catch (err: any) {
    return { status: 'offline', ok: false, message: err.message || 'Offline' }
  }
}
