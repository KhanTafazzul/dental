'use server'

/**
 * @file actions/appointments.actions.ts
 * @description Server Actions for appointment management.
 *
 * Covers: Update status, book offline, postpone, schedule reappointment,
 * send patient reports, send appointment emails, capture ticket management,
 * and OTP-based mobile verification.
 */

import { revalidatePath } from 'next/cache'
import { getAdminSupabase } from '@/lib/supabase'
import { sendNotification } from '@/lib/messaging'
import { sendWahaTextMessage } from '@/lib/waha'
import { isPhoneVerifiedBackend } from '@/actions/otp.actions'
import type { ActionResponse, AppointmentStatus } from '@/types/common.types'

// ─── Helper: Save image to Supabase Storage ──────────────────────────────────

/**
 * Uploads a file to the "reports" Supabase storage bucket.
 * Auto-creates the bucket if it doesn't exist.
 * @returns Public URL of the uploaded file
 */
async function saveProfileImage(file: File): Promise<string> {
  const adminDb = getAdminSupabase()

  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('No valid file was received by the server.')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const uniqueFileName = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`

  let uploadRes = await adminDb.storage
    .from('reports')
    .upload(uniqueFileName, buffer, { contentType: file.type, upsert: true })

  // Auto-create bucket if it doesn't exist
  if (uploadRes.error?.message?.toLowerCase().includes('bucket not found')) {
    console.log('[Storage] Bucket "reports" missing. Creating dynamically...')
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

// ─── Update Appointment Status ────────────────────────────────────────────────

/**
 * Updates the status of an appointment (pending, confirmed, completed, cancelled).
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[Appointments] Error updating status:', err)
    return { success: false, error: err.message || 'Failed to update appointment status.' }
  }
}

// ─── Book Offline Appointment ─────────────────────────────────────────────────

/**
 * Creates a new offline/walk-in appointment.
 * Validates OTP if required, resolves or creates the patient record,
 * and inserts the appointment.
 */
export async function bookOfflineAppointment(formData: FormData): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()

  const patientName = formData.get('patientName') as string
  const patientEmail = formData.get('patientEmail') as string
  const patientMobile = formData.get('patientMobile') as string
  const patientAge = parseInt(formData.get('patientAge') as string || '0', 10)
  const branchId = formData.get('branchId') as string
  const doctorId = formData.get('doctorId') as string
  const appointmentDate = formData.get('appointmentDate') as string
  const appointmentTime = formData.get('appointmentTime') as string
  const problemDescription = formData.get('problemDescription') as string
  const skipOtpBypass = formData.get('skipOtp') === 'true'

  try {
    // 1. OTP verification check (backend-enforced)
    if (!skipOtpBypass && patientMobile) {
      const verified = await isPhoneVerifiedBackend(patientMobile)
      if (!verified) {
        return {
          success: false,
          error: 'Mobile number verification required! Please verify the 6-digit OTP sent to WhatsApp before booking.',
        }
      }
    }

    // 2. Validate appointment date (must be within last 3 days or future)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minDate = new Date()
    minDate.setDate(today.getDate() - 3)
    minDate.setHours(0, 0, 0, 0)
    const selectedDate = new Date(appointmentDate)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < minDate) {
      return { success: false, error: 'Offline appointments can only be backdated up to 3 days.' }
    }

    // 3. Resolve or create patient record
    const trimmedEmail = patientEmail.trim().toLowerCase()
    const trimmedName = patientName.trim()
    const trimmedMobile = patientMobile.trim()

    const { data: existingPatient } = await adminDb
      .from('patients')
      .select('*')
      .ilike('name', trimmedName)
      .or(`email.eq.${trimmedEmail},mobile.eq.${trimmedMobile}`)
      .maybeSingle()

    let patientId = ''

    if (existingPatient) {
      patientId = existingPatient.id
      await adminDb
        .from('patients')
        .update({ mobile: trimmedMobile, age: patientAge })
        .eq('id', patientId)
    } else {
      const { data: newPatient, error: patientInsertErr } = await adminDb
        .from('patients')
        .insert({ name: trimmedName, email: trimmedEmail, mobile: trimmedMobile, age: patientAge })
        .select('id')
        .single()

      if (patientInsertErr) throw patientInsertErr
      patientId = newPatient.id
    }

    // 4. Create appointment
    const { data: newAppt, error: apptErr } = await adminDb
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        branch_id: branchId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        problem_description: problemDescription.trim() || null,
        status: 'confirmed',
      })
      .select()
      .single()

    if (apptErr) {
      if (apptErr.code === '23505') {
        return { success: false, error: 'This time slot is already booked for this doctor on this day.' }
      }
      throw apptErr
    }

    return { success: true, data: newAppt }
  } catch (err: any) {
    console.error('[Appointments] Error booking offline appointment:', err)
    return { success: false, error: err.message || 'Failed to book offline appointment.' }
  }
}

// ─── Postpone Appointment ─────────────────────────────────────────────────────

/**
 * Reschedules an appointment to a new date/time and notifies the patient.
 */
export async function postponeAppointmentAction(
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { data: updated, error: updateErr } = await adminDb
      .from('appointments')
      .update({ appointment_date: newDate, appointment_time: newTime })
      .eq('id', appointmentId)
      .select('*, patients(*), doctors(*), branches(*)')
      .single()

    if (updateErr) throw updateErr

    const patient = (updated as any)?.patients
    const doctor = (updated as any)?.doctors
    const branch = (updated as any)?.branches

    if (patient) {
      const patientName = patient.name || 'Valued Patient'
      const doctorName = doctor?.name ? `Dr. ${doctor.name}` : 'your doctor'
      const branchName = branch?.name || 'our clinic'
      const messageBody = `Hello ${patientName},\n\nYour appointment with ${doctorName} at ${branchName} has been rescheduled to:\nDate: ${newDate}\nTime: ${newTime}\n\nIf you have any questions, please contact our clinic reception. Thank you.`

      await sendNotification({
        recipientName: patientName,
        recipientPhone: patient.mobile,
        recipientEmail: patient.email,
        subject: 'Appointment Rescheduled - Dental Clinic',
        messageBody,
        type: 'appointment_postponed',
      })
    }

    return { success: true, data: updated }
  } catch (err: any) {
    console.error('[Appointments] Error postponing appointment:', err)
    return { success: false, error: err.message || 'Failed to postpone appointment.' }
  }
}

// ─── Schedule Reappointment ───────────────────────────────────────────────────

export interface ReappointmentParams {
  patientName: string
  patientPhone: string
  patientEmail?: string
  doctorId?: string
  doctorName?: string
  branchId?: string
  branchSlug?: string
  followUpDays?: number
  targetTeeth?: string
  treatmentNotes?: string
}

/**
 * Schedules a multi-visit follow-up appointment N days from today.
 * Sends WhatsApp notification via WAHA on success.
 */
export async function scheduleReappointment(params: ReappointmentParams): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const days = params.followUpDays || 5
    const followUpDate = new Date()
    followUpDate.setDate(followUpDate.getDate() + days)
    const dateStr = followUpDate.toISOString().split('T')[0]
    const formattedDate = followUpDate.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })

    const teethLabel = params.targetTeeth ? ` (${params.targetTeeth})` : ''
    const reasonText = `Multi-Visit Reappointment${teethLabel}: ${params.treatmentNotes || 'Follow-up dental procedure'}`

    const { data: newAppt, error } = await adminDb
      .from('appointments')
      .insert({
        patient_name: params.patientName,
        phone: params.patientPhone,
        email: params.patientEmail || '',
        doctor_id: params.doctorId || null,
        doctor_name: params.doctorName || 'Assigned Dentist',
        branch_id: params.branchId || null,
        appointment_date: dateStr,
        appointment_time: '11:00 AM',
        status: 'confirmed',
        reason: reasonText,
        treatment: params.treatmentNotes || 'Tooth Reappointment',
        notes: `Scheduled ${days}-day follow-up for ${params.targetTeeth || 'procedure'}`,
      })
      .select()
      .single()

    if (error) console.warn('[Appointments] Reappointment insert notice:', error)

    const messageBody =
      `[REAPPOINTMENT CONFIRMATION - HAZARA & FAMILY DENTAL CLINICS]\n\n` +
      `Dear ${params.patientName},\n\n` +
      `Your ${days}-day follow-up consultation${teethLabel} has been scheduled:\n\n` +
      `Date: ${formattedDate}\n` +
      `Attending Doctor: ${params.doctorName || 'Senior Dental Surgeon'}\n` +
      `Clinical Procedure: ${params.treatmentNotes || 'Follow-up Dental Care'}\n\n` +
      `Please contact our clinic helpline if you require rescheduling or assistance.`

    await sendNotification({
      recipientName: params.patientName,
      recipientPhone: params.patientPhone,
      recipientEmail: params.patientEmail,
      subject: `Follow-up Reappointment Confirmed (${formattedDate})`,
      messageBody,
      type: 'appointment_confirmation',
    })

    revalidatePath('/admin')
    revalidatePath('/doctor')

    return { success: true, data: { date: formattedDate, appointment: newAppt } }
  } catch (err: any) {
    console.error('[Appointments] Schedule reappointment error:', err)
    return { success: false, error: err.message || 'Failed to schedule reappointment.' }
  }
}

// ─── Send Patient Report ──────────────────────────────────────────────────────

/**
 * Saves uploaded patient files, updates appointment, and sends WhatsApp notification.
 */
export async function sendPatientReport(formData: FormData): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()

  const appointmentId = formData.get('appointmentId') as string
  const patientEmail = formData.get('patientEmail') as string
  const prescriptionText = formData.get('prescriptionText') as string
  const xrayFile = formData.get('xray') as File | null
  const prescriptionFile = formData.get('prescription') as File | null
  const tempMobilePhotoUrl = formData.get('tempMobilePhoto') as string | null

  try {
    const { data: appt, error: apptErr } = await adminDb
      .from('appointments')
      .select('*, patients(*), branches(*), doctors(*)')
      .eq('id', appointmentId)
      .single()

    if (apptErr || !appt) throw new Error('Appointment not found')

    const patientId = (appt as any).patients?.id
    let finalPatientId = patientId
    let finalPatient = (appt as any).patients

    // Update/resolve patient email if changed
    if (patientEmail && patientEmail.trim().toLowerCase() !== (appt as any).patients?.email) {
      const targetEmail = patientEmail.trim().toLowerCase()
      const { data: existingPatient } = await adminDb
        .from('patients')
        .select('*')
        .eq('email', targetEmail)
        .ilike('name', (appt as any).patients?.name)
        .maybeSingle()

      if (existingPatient) {
        finalPatientId = existingPatient.id
        finalPatient = existingPatient
      } else {
        const { data: updatedPat, error: emailErr } = await adminDb
          .from('patients')
          .update({ email: targetEmail })
          .eq('id', patientId)
          .select()
          .single()
        if (emailErr) throw emailErr
        finalPatient = updatedPat
      }
    }

    // Upload files to storage
    let xrayUrl = (appt as any).xray_url || ''
    if (xrayFile && xrayFile.size > 0) xrayUrl = await saveProfileImage(xrayFile)

    let prescriptionUrl = (appt as any).prescription_url || tempMobilePhotoUrl || ''
    if (prescriptionFile && prescriptionFile.size > 0) prescriptionUrl = await saveProfileImage(prescriptionFile)

    // Update appointment record
    const { error: updateErr } = await adminDb
      .from('appointments')
      .update({
        patient_id: finalPatientId,
        prescription_text: prescriptionText || null,
        prescription_url: prescriptionUrl || null,
        xray_url: xrayUrl || null,
        temp_mobile_photo: null,
        report_sent_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)

    if (updateErr) throw updateErr

    // Clear capture ticket on branch
    if ((appt as any).branch_id) {
      await adminDb
        .from('branches')
        .update({ active_capture_appointment_id: null })
        .eq('id', (appt as any).branch_id)
        .eq('active_capture_appointment_id', appointmentId)
    }

    // Send WhatsApp notification to patient
    const patientPhone = finalPatient?.mobile || (appt as any).patients?.mobile
    if (patientPhone) {
      try {
        const branchName = (appt as any).branches?.name || 'Hazara & Family Dental Clinic'
        const doctorName = (appt as any).doctors?.name ? `Dr. ${(appt as any).doctors.name}` : 'Senior Dental Surgeon'
        const wahaText =
          `[${branchName.toUpperCase()} - PRESCRIPTION & CLINICAL SUMMARY]\n\n` +
          `Dear ${finalPatient?.name || 'Patient'},\n\n` +
          `Your clinical consultation record with ${doctorName} has been processed.\n\n` +
          `Prescription Notes:\n${prescriptionText || 'Diagnostic notes and prescription issued by attending doctor.'}\n` +
          (xrayUrl ? `\nDigital Radiographic Report: ${xrayUrl}\n` : '') +
          (prescriptionUrl ? `\nDigital Prescription Document: ${prescriptionUrl}\n` : '') +
          `\nThank you for choosing ${branchName}. For inquiries, contact our clinical care desk.`

        await sendWahaTextMessage({ phone: patientPhone, text: wahaText })
      } catch (wahaErr) {
        console.warn('[Appointments] WAHA notification warning (non-fatal):', wahaErr)
      }
    }

    return {
      success: true,
      data: { updatedPatient: finalPatient, xrayUrl: xrayUrl || null, prescriptionUrl: prescriptionUrl || null },
    }
  } catch (err: any) {
    console.error('[Appointments] Error in sendPatientReport:', err)
    return { success: false, error: err.message || 'Failed to send reports.' }
  }
}

// ─── Capture Ticket Management ────────────────────────────────────────────────

/** Creates a mobile-camera capture ticket for a branch. */
export async function createCaptureTicket(branchId: string, appointmentId: string): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb
      .from('branches')
      .update({ active_capture_appointment_id: appointmentId })
      .eq('id', branchId)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[Appointments] Error creating capture ticket:', err)
    return { success: false, error: err.message || 'Failed to create capture ticket.' }
  }
}

/** Clears the mobile-camera capture ticket for a branch. */
export async function clearCaptureTicket(branchId: string): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { error } = await adminDb
      .from('branches')
      .update({ active_capture_appointment_id: null })
      .eq('id', branchId)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('[Appointments] Error clearing capture ticket:', err)
    return { success: false, error: err.message || 'Failed to clear capture ticket.' }
  }
}

/** Uploads a mobile-captured prescription photo and links it to the appointment. */
export async function uploadMobilePrescription(formData: FormData): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  const appointmentId = formData.get('appointmentId') as string
  const branchSlug = formData.get('branchSlug') as string
  const passcode = formData.get('passcode') as string
  const photoFile = formData.get('photo') as File

  try {
    const { data: branch, error: branchErr } = await adminDb
      .from('branches')
      .select('camera_passcode')
      .eq('slug', branchSlug)
      .single()

    if (branchErr || !branch) throw new Error('Branch not found')
    if (branch.camera_passcode !== passcode) throw new Error('Unauthorized: Invalid passcode')

    const imageUrl = await saveProfileImage(photoFile)

    const { error: apptErr } = await adminDb
      .from('appointments')
      .update({ temp_mobile_photo: imageUrl })
      .eq('id', appointmentId)

    if (apptErr) throw apptErr
    return { success: true, data: { url: imageUrl } }
  } catch (err: any) {
    console.error('[Appointments] Error uploading mobile photo:', err)
    return { success: false, error: err.message || 'Failed to upload photo.' }
  }
}

// ─── Network Utilities ────────────────────────────────────────────────────────

/**
 * Fetches the server machine's local IPv4 address.
 * Used for mobile camera QR-code redirect.
 */
export async function getLocalIpAddress(): Promise<ActionResponse<{ ip: string }>> {
  try {
    const os = await import('os')
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          return { success: true, data: { ip: net.address } }
        }
      }
    }
    return { success: true, data: { ip: 'localhost' } }
  } catch (err: any) {
    console.error('[Network] Error fetching IP:', err)
    return { success: false, error: err.message || 'Failed to fetch local IP.' }
  }
}

/** Validates a camera passcode for a branch. */
export async function validateCameraPasscode(
  branchSlug: string,
  passcode: string
): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { data, error } = await adminDb
      .from('branches')
      .select('id, camera_passcode')
      .eq('slug', branchSlug)
      .single()

    if (error || !data) throw new Error('Branch not found')
    if (data.camera_passcode === passcode) return { success: true }
    return { success: false, error: 'Incorrect passcode.' }
  } catch (err: any) {
    console.error('[Appointments] Error validating passcode:', err)
    return { success: false, error: err.message || 'Passcode verification failed.' }
  }
}

// ─── Email Notifications ──────────────────────────────────────────────────────

/**
 * Sends a booking confirmation email to the assigned doctor via Brevo.
 */
export async function sendAppointmentEmail(appointmentId: string): Promise<ActionResponse> {
  const adminDb = getAdminSupabase()
  try {
    const { data: appt, error: apptErr } = await adminDb
      .from('appointments')
      .select('*, patients(*), doctors(*), branches(*)')
      .eq('id', appointmentId)
      .single()

    if (apptErr || !appt) throw new Error(`Appointment not found: ${apptErr?.message}`)

    const patient = (appt as any).patients
    const doctor = (appt as any).doctors
    const branch = (appt as any).branches

    if (!doctor?.email) throw new Error('Doctor email is missing or not assigned.')

    const brevoApiKey = process.env.BREVO_API_KEY
    if (!brevoApiKey) throw new Error('Missing BREVO_API_KEY environment variable.')

    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'dental@flynx.site'
    const emailSubject = `[Booking Alert] New Patient Appointment - ${branch.name}`
    const problemText = appt.problem_description?.trim() || 'No problem description provided.'

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px;">New Appointment Details</h2>
        <p>Hello Dr. <strong>${doctor.name}</strong>,</p>
        <p>A new appointment has been scheduled at <strong>${branch.name}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Patient:</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${patient.name}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Date:</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${appt.appointment_date}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Time:</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${appt.appointment_time}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Problem:</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${problemText}</td></tr>
        </table>
      </div>
    `

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: branch.name, email: brevoSenderEmail },
        to: [{ email: doctor.email.trim().toLowerCase(), name: doctor.name }],
        subject: emailSubject,
        htmlContent: emailHtml,
      }),
    })

    if (!response.ok) {
      const resText = await response.text()
      throw new Error(`Brevo Error: ${resText}`)
    }

    return { success: true }
  } catch (err: any) {
    console.error('[Appointments] Error in sendAppointmentEmail:', err)
    return { success: false, error: err.message || 'Failed to send email to doctor.' }
  }
}
