/**
 * @file lib/services/notificationService.ts
 * @description Multi-Channel Notification Engine: WAHA WhatsApp, Brevo (for Patients), and Resend (for Doctors).
 *
 * Implements:
 * - WAHA (WhatsApp HTTP API) POST /api/sendFile document dispatch with personalized caption
 * - Brevo API: Official patient email delivery with attached compressed PDF and branded HTML
 * - Resend API: Official doctor notification delivery
 * - Asynchronous execution and database status updates (delivery_status)
 */

import { SERVER_ENV } from '@/config/env'
import { getAdminSupabase } from '@/lib/supabase'
import { formatWahaChatId, sendWahaTextMessage } from '@/lib/waha'

export interface PrescriptionNotificationPayload {
  prescriptionId: string
  patientName: string
  patientPhone?: string
  patientEmail?: string
  doctorName?: string
  visitDate: string
  presignedUrl: string
  pdfBuffer?: Buffer
  medicines?: string[]
  diagnosisText?: string
  clinicName?: string
  clinicPhone?: string
}

export interface DeliveryResult {
  whatsapp: 'sent' | 'failed' | 'pending' | 'skipped'
  email: 'sent' | 'failed' | 'pending' | 'skipped'
  lastAttempt: string
  whatsappError?: string
  emailError?: string
  details?: Record<string, unknown>
}

export class NotificationService {
  /**
   * Dispatches multi-channel prescription notification (WhatsApp + Email) asynchronously.
   * Updates the prescriptions database record upon completion.
   */
  static async dispatchPrescriptionNotification(
    payload: PrescriptionNotificationPayload,
    channels: { whatsapp?: boolean; email?: boolean } = { whatsapp: true, email: true }
  ): Promise<DeliveryResult> {
    const timestamp = new Date().toISOString()
    const result: DeliveryResult = {
      whatsapp: 'pending',
      email: 'pending',
      lastAttempt: timestamp,
    }

    const {
      prescriptionId,
      patientName,
      patientPhone,
      patientEmail,
      doctorName = 'Dr. Falix',
      visitDate,
      presignedUrl,
      pdfBuffer,
      medicines = [],
      clinicName = 'Falix Dental Clinic',
      clinicPhone = '+91 84188 78491',
    } = payload

    const cleanDate = visitDate || new Date().toISOString().split('T')[0]
    const cleanDoctor = doctorName.replace(/\s+/g, '_')
    const fileName = `Prescription_${cleanDoctor}_${cleanDate}.pdf`

    // ── 1. WhatsApp Delivery via WAHA /api/sendFile ──
    if (channels.whatsapp && patientPhone) {
      try {
        const formattedChatId = formatWahaChatId(patientPhone)
        if (!formattedChatId) {
          result.whatsapp = 'skipped'
          result.whatsappError = 'Invalid recipient phone number format'
        } else {
          const wahaRes = await this.sendWahaPrescriptionDocument({
            chatId: formattedChatId,
            fileUrl: presignedUrl,
            fileName,
            patientName,
            doctorName,
            visitDate: cleanDate,
            clinicName,
            clinicPhone,
          })

          if (wahaRes.success) {
            result.whatsapp = 'sent'
          } else {
            result.whatsapp = 'failed'
            result.whatsappError = wahaRes.error
          }
        }
      } catch (err: any) {
        console.error('[NotificationService] WhatsApp dispatch error:', err)
        result.whatsapp = 'failed'
        result.whatsappError = err.message || 'WhatsApp dispatch failed'
      }
    } else {
      result.whatsapp = patientPhone ? 'skipped' : 'skipped'
      if (!patientPhone) result.whatsappError = 'No recipient phone provided'
    }

    // ── 2. Email Delivery via Nodemailer / Brevo / Resend ──
    if (channels.email && patientEmail) {
      try {
        const emailRes = await this.sendPrescriptionEmail({
          recipientEmail: patientEmail,
          patientName,
          doctorName,
          visitDate: cleanDate,
          presignedUrl,
          pdfBuffer,
          fileName,
          medicines,
          clinicName,
          clinicPhone,
        })

        if (emailRes.success) {
          result.email = 'sent'
        } else {
          result.email = 'failed'
          result.emailError = emailRes.error
        }
      } catch (err: any) {
        console.error('[NotificationService] Email dispatch error:', err)
        result.email = 'failed'
        result.emailError = err.message || 'Email dispatch failed'
      }
    } else {
      result.email = 'skipped'
      if (!patientEmail) result.emailError = 'No recipient email provided'
    }

    // ── 3. Update Delivery Status in Database ──
    try {
      const adminDb = getAdminSupabase()
      await adminDb
        .from('prescriptions')
        .update({
          delivery_status: {
            whatsapp: result.whatsapp,
            email: result.email,
            last_attempt: timestamp,
            whatsapp_error: result.whatsappError || null,
            email_error: result.emailError || null,
          },
          updated_at: timestamp,
        })
        .eq('id', prescriptionId)
    } catch (dbErr) {
      console.warn('[NotificationService] Notice updating delivery status in DB:', dbErr)
    }

    return result
  }

  /**
   * Sends PDF Document directly via WAHA /api/sendFile.
   * If sendFile fails or is restricted, falls back gracefully to a formatted WhatsApp text message with presigned URL.
   */
  private static async sendWahaPrescriptionDocument(params: {
    chatId: string
    fileUrl: string
    fileName: string
    patientName: string
    doctorName: string
    visitDate: string
    clinicName: string
    clinicPhone: string
  }): Promise<{ success: boolean; error?: string }> {
    const { chatId, fileUrl, fileName, patientName, doctorName, visitDate, clinicName, clinicPhone } = params

    const endpoint = SERVER_ENV.WAHA_ENDPOINT || ''
    const apiKey = SERVER_ENV.WAHA_API_KEY || ''
    const session = SERVER_ENV.WAHA_SESSION || 'whatsappp-api-dental'

    const caption =
      `🦷 *${clinicName} — Official Digital Prescription*\n\n` +
      `Dear *${patientName}*,\n` +
      `Thank you for visiting us. Your consultation summary and prescription issued by *${doctorName}* on *${visitDate}* is attached below.\n\n` +
      `📥 *Secure Download Link:* ${fileUrl}\n\n` +
      `If you experience any discomfort or have questions regarding dosage, please contact our front desk at ${clinicPhone}.\n\n` +
      `_Wishing you a healthy, radiant smile!_`

    // Derive /api/sendFile URL from base endpoint
    let sendFileUrl = endpoint
    if (endpoint.includes('/api/sendText')) {
      sendFileUrl = endpoint.replace('/api/sendText', '/api/sendFile')
    } else if (!endpoint.endsWith('/api/sendFile')) {
      sendFileUrl = `${endpoint.replace(/\/$/, '')}/api/sendFile`
    }

    // Try sending file via WAHA sendFile
    if (endpoint) {
      try {
        console.log(`[WAHA] Sending prescription file to ${chatId} via ${sendFileUrl}`)

        const res = await fetch(sendFileUrl, {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId,
            session,
            file: {
              mimetype: 'application/pdf',
              filename: fileName,
              url: fileUrl,
            },
            caption,
          }),
        })

        if (res.ok) {
          console.log(`[WAHA] Prescription document delivered successfully to ${chatId}`)
          return { success: true }
        }

        const errText = await res.text()
        console.warn(`[WAHA] sendFile returned status ${res.status}: ${errText}. Attempting text fallback...`)
      } catch (fetchErr: any) {
        console.warn('[WAHA] sendFile request failed, falling back to text:', fetchErr.message)
      }
    }

    // ── Graceful Fallback: Send formatted text notification with download link ──
    const textRes = await sendWahaTextMessage({
      phone: chatId,
      text: caption,
      session,
      endpoint,
      apiKey,
    })

    return {
      success: textRes.success,
      error: textRes.error,
    }
  }

  /**
   * Sends prescription via SMTP (Nodemailer) with PDF attachment.
   * Falls back to Brevo or Resend HTTP APIs if SMTP is unconfigured.
   */
  private static async sendPrescriptionEmail(params: {
    recipientEmail: string
    patientName: string
    doctorName: string
    visitDate: string
    presignedUrl: string
    pdfBuffer?: Buffer
    fileName: string
    medicines: string[]
    clinicName: string
    clinicPhone: string
  }): Promise<{ success: boolean; error?: string }> {
    const {
      recipientEmail,
      patientName,
      doctorName,
      visitDate,
      presignedUrl,
      pdfBuffer,
      fileName,
      medicines,
      clinicName,
      clinicPhone,
    } = params

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f4; color: #2C3325; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E4E7D3; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: #4A5D23; color: #ffffff; padding: 32px 24px; text-align: center; }
          .title { font-size: 22px; font-weight: 700; margin: 0 0 8px 0; }
          .subtitle { font-size: 13px; opacity: 0.9; margin: 0; }
          .content { padding: 32px 24px; }
          .card { background: #F8FAF6; border: 1px solid #E4E7D3; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .med-list { margin: 12px 0; padding-left: 20px; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; background: #4A5D23; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 14px; margin-top: 16px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #8A9380; border-top: 1px solid #F4F6F0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🦷 ${clinicName}</h1>
            <p class="subtitle">Official Medical Consultation & Digital Prescription</p>
          </div>
          <div class="content">
            <p>Dear <strong>${patientName}</strong>,</p>
            <p>Thank you for consulting with <strong>${doctorName}</strong> on <strong>${visitDate}</strong>. Your official digital prescription has been generated and securely archived.</p>
            
            ${
              medicines.length > 0
                ? `<div class="card">
                    <strong style="color: #4A5D23; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Prescribed Medications</strong>
                    <ul class="med-list">
                      ${medicines.map((m) => `<li>${m}</li>`).join('')}
                    </ul>
                  </div>`
                : ''
            }

            <p style="font-size: 14px; line-height: 1.6;">
              The full medical prescription document is attached to this email. You can also view and download it at any time using the secure button below:
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${presignedUrl}" class="btn" target="_blank">View / Download Prescription PDF</a>
            </div>

            <p style="font-size: 12px; color: #666; margin-top: 24px;">
              * Note: For security and patient privacy compliance, download links expire periodically.
            </p>
          </div>
          <div class="footer">
            <p>${clinicName} • Front Desk: ${clinicPhone}</p>
            <p>This is an automated clinical notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // ── Patient Email Dispatch via Brevo API ──
    if (SERVER_ENV.BREVO_API_KEY) {
      try {
        const brevoPayload: any = {
          sender: { name: clinicName, email: SERVER_ENV.BREVO_SENDER_EMAIL },
          to: [{ email: recipientEmail, name: patientName }],
          subject: `Digital Prescription — ${clinicName}`,
          htmlContent,
        }

        if (pdfBuffer && pdfBuffer.length > 0) {
          brevoPayload.attachment = [
            {
              name: fileName,
              content: pdfBuffer.toString('base64'),
            },
          ]
        }

        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': SERVER_ENV.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brevoPayload),
        })

        if (brevoRes.ok) {
          console.log(`[NotificationService] Brevo email sent successfully to ${recipientEmail}`)
          return { success: true }
        }
      } catch (brevoErr: any) {
        console.warn('[NotificationService] Brevo delivery notice:', brevoErr.message)
      }
    }

    // ── Strategy C: Resend API Fallback ──
    if (SERVER_ENV.RESEND_API_KEY) {
      try {
        const resendPayload: any = {
          from: `${clinicName} <onboarding@resend.dev>`,
          to: [recipientEmail],
          subject: `Digital Prescription — ${clinicName}`,
          html: htmlContent,
        }

        if (pdfBuffer && pdfBuffer.length > 0) {
          resendPayload.attachments = [
            {
              filename: fileName,
              content: pdfBuffer.toString('base64'),
            },
          ]
        }

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SERVER_ENV.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        })

        if (resendRes.ok) {
          console.log(`[NotificationService] Resend email sent successfully to ${recipientEmail}`)
          return { success: true }
        }
      } catch (resendErr: any) {
        console.warn('[NotificationService] Resend delivery notice:', resendErr.message)
      }
    }

    return {
      success: false,
      error: 'Brevo and Resend email transports failed or keys are missing.',
    }
  }

  /**
   * Dedicated Doctor Notification via Resend API
   */
  static async sendDoctorNotification(params: {
    doctorEmail: string
    doctorName: string
    patientName: string
    visitDate: string
    presignedUrl: string
    clinicName?: string
  }): Promise<{ success: boolean; error?: string }> {
    const { doctorEmail, doctorName, patientName, visitDate, presignedUrl, clinicName = 'Falix Dental Clinic' } = params

    if (!SERVER_ENV.RESEND_API_KEY) {
      return { success: false, error: 'RESEND_API_KEY not configured for doctor emails.' }
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVER_ENV.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${clinicName} <onboarding@resend.dev>`,
          to: [doctorEmail],
          subject: `New Prescription Logged: ${patientName} (${visitDate})`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Dr. ${doctorName},</h2>
              <p>A new digital prescription has been logged and archived for <strong>${patientName}</strong> on <strong>${visitDate}</strong>.</p>
              <p><a href="${presignedUrl}" style="background: #4A5D23; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">View Prescription PDF</a></p>
            </div>
          `,
        }),
      })

      return { success: res.ok }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
}
