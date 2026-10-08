import { getAdminSupabase } from './supabase'

export interface WahaSendTextParams {
  phone: string
  text: string
  session?: string
  endpoint?: string
  apiKey?: string
}

export interface WahaSendResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
  chatId?: string
  status?: number
}

export interface WahaDoctorRecord {
  id: string | number
  name: string
  phone?: string
  email?: string
  specialty?: string
  branch_id?: string | number
}

export interface WahaAppointmentRecord {
  id?: string
  doctor_id?: string | number
  doctor_name?: string
  appointment_date?: string
  appointment_time?: string
  patient_name?: string
  name?: string
  gender?: string
  age?: number | string
  treatment?: string
  service_name?: string
  reason?: string
  patient_phone?: string
  phone?: string
  status?: string
  token_number?: string
}

export interface WahaBranchRecord {
  id?: string | number
  name?: string
  address?: string
  phone?: string
  slug?: string
}

// Default Configuration matching WAHA Render Deployment (Configurable via ENV)
export const DEFAULT_WAHA_ENDPOINT = process.env.WAHA_ENDPOINT || ''
export const DEFAULT_WAHA_API_KEY = process.env.WAHA_API_KEY || ''
export const DEFAULT_WAHA_SESSION = process.env.WAHA_SESSION || 'whatsappp-api-dental'
export const DEFAULT_TARGET_TEST_NUMBER = process.env.WAHA_TARGET_NUMBER || '918418878491@c.us'

/**
 * Formats raw phone number to WAHA chatId standard format:
 * Removes '+', spaces, hyphens, and non-digits.
 * Appends '@c.us' at the end.
 *
 * Example: "+91 8418878491" -> "918418878491@c.us"
 * Example: "8418878491" -> "918418878491@c.us"
 */
export function formatWahaChatId(phone: string): string {
  if (!phone) return ''
  
  // Strip all non-digit characters
  let digits = phone.replace(/[^0-9]/g, '')
  
  // Prepend India country code (91) if user entered 10 digits
  if (digits.length === 10) {
    digits = `91${digits}`
  }
  
  // Ensure @c.us suffix for standard WhatsApp individual contact
  if (!digits.endsWith('@c.us')) {
    return `${digits}@c.us`
  }
  
  return digits
}

/**
 * Anti-Ban Protection: Generates a randomized delay between 2.5s and 5.0s
 * to mimic human typing and avoid Meta/WhatsApp rate-limit bans.
 */
export async function delayWithRandomJitter(minMs = 2500, maxMs = 5000): Promise<void> {
  const ms = Math.floor(minMs + Math.random() * (maxMs - minMs))
  console.log(`[Anti-Ban Protection] Delaying next bulk dispatch by ${(ms / 1000).toFixed(2)}s`)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Sends a WhatsApp text message via WAHA (WhatsApp HTTP API - GOWS engine on Render).
 * Uses HTTP POST with X-Api-Key authentication header and JSON payload.
 */
export async function sendWahaTextMessage({
  phone,
  text,
  session = DEFAULT_WAHA_SESSION,
  endpoint = DEFAULT_WAHA_ENDPOINT,
  apiKey = DEFAULT_WAHA_API_KEY,
}: WahaSendTextParams): Promise<WahaSendResponse> {
  const formattedChatId = formatWahaChatId(phone)

  if (!formattedChatId) {
    return {
      success: false,
      error: 'Invalid recipient phone number provided.',
    }
  }

  const payload = {
    chatId: formattedChatId,
    text,
    session,
  }

  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  }

  console.log(`[WAHA Engine] Sending text to ${formattedChatId} via ${endpoint}`)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const status = response.status
    let resData: Record<string, unknown> = {}
    
    try {
      const responseText = await response.text()
      if (responseText) {
        try {
          resData = JSON.parse(responseText) as Record<string, unknown>
        } catch {
          resData = { rawText: responseText }
        }
      }
    } catch {
      resData = {}
    }

    if (!response.ok) {
      const errMsg = (resData.message as string) || (resData.error as string) || `WAHA HTTP Error ${status}: ${response.statusText}`
      console.error(`[WAHA Error] Status ${status}:`, resData)

      // Automatic Fallback Retry if custom session name does not exist
      if (session !== 'default' && (errMsg.includes('Session') || errMsg.includes('does not exist'))) {
        console.warn(`[WAHA Fallback] Custom session "${session}" failed. Retrying with default session...`)
        return sendWahaTextMessage({
          phone,
          text,
          session: 'default',
          endpoint,
          apiKey,
        })
      }

      return {
        success: false,
        status,
        error: errMsg,
        chatId: formattedChatId,
        data: resData,
      }
    }

    console.log(`[WAHA Success] Message sent to ${formattedChatId}:`, resData)

    // Audit log insertion into database (non-blocking)
    logWahaMessage({
      recipientPhone: phone,
      chatId: formattedChatId,
      messageBody: text,
      status: 'sent_live',
      responseData: resData,
    })

    return {
      success: true,
      status,
      chatId: formattedChatId,
      data: resData,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Connection Error'
    console.error('[WAHA Connection Exception]:', errorMsg)
    
    logWahaMessage({
      recipientPhone: phone,
      chatId: formattedChatId,
      messageBody: text,
      status: `failed (${errorMsg})`,
      responseData: { error: errorMsg },
    })

    return {
      success: false,
      error: `Connection to WAHA server on Render failed: ${errorMsg}`,
      chatId: formattedChatId,
    }
  }
}

/**
 * Health check & Keep-Alive pinger for Render free-tier instance (pings WAHA server).
 */
export async function checkWahaHealth(): Promise<{ status: string; ok: boolean; message: string }> {
  const endpoint = DEFAULT_WAHA_ENDPOINT
  const apiKey = DEFAULT_WAHA_API_KEY
  
  // Infer base URL from /api/sendText or direct server URL
  const baseUrl = endpoint.includes('/api/sendText') 
    ? endpoint.replace('/api/sendText', '/api/sessions')
    : `${endpoint.replace(/\/$/, '')}/api/sessions`

  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      let data: unknown[] = []
      try {
        const text = await response.text()
        data = text ? (JSON.parse(text) as unknown[]) : []
      } catch {
        data = []
      }
      return {
        status: 'online',
        ok: true,
        message: `WAHA GOWS Engine on Render is active & healthy (${Array.isArray(data) ? data.length : 1} active session(s)).`,
      }
    } else {
      return {
        status: 'warning',
        ok: false,
        message: `WAHA Server returned HTTP status ${response.status}.`,
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Timeout/Sleep'
    return {
      status: 'offline',
      ok: false,
      message: `Unable to connect to WAHA Render endpoint: ${errorMsg}`,
    }
  }
}

/**
 * Daily Morning Doctor Appointment Digest Dispatcher.
 * 100% Dynamic: Fetches real active doctors and today's real booked appointments from Supabase!
 */
export async function sendDailyDoctorAppointmentDigest(): Promise<{
  success: boolean
  count: number
  sentDoctors: string[]
  details: Record<string, unknown>[]
}> {
  const adminDb = getAdminSupabase()
  const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const details: Record<string, unknown>[] = []
  const sentDoctors: string[] = []

  try {
    // 1. Fetch real active doctors dynamically from Supabase
    const { data: doctors, error: docErr } = await adminDb
      .from('doctors')
      .select('id, name, phone, email, specialty, branch_id')

    if (docErr) {
      console.warn('[WAHA Digest] Database notice when fetching doctors from Supabase:', docErr)
    }

    const doctorList: WahaDoctorRecord[] = (doctors && doctors.length > 0)
      ? (doctors as WahaDoctorRecord[])
      : []

    if (doctorList.length === 0) {
      console.log('[WAHA Digest] No registered doctors found in Supabase database.')
      return {
        success: true,
        count: 0,
        sentDoctors: [],
        details: [{ message: 'No registered doctor records found in database.' }],
      }
    }

    // 2. Fetch today's real appointments dynamically from Supabase
    const { data: appointments, error: apptErr } = await adminDb
      .from('appointments')
      .select('*')
      .eq('appointment_date', todayStr)

    if (apptErr) {
      console.warn('[WAHA Digest] Database notice when fetching today appointments:', apptErr)
    }

    const apptList: WahaAppointmentRecord[] = (appointments as WahaAppointmentRecord[]) || []

    for (const doc of doctorList) {
      // Find appointments assigned to this specific doctor
      const docAppts = apptList.filter((a) => 
        String(a.doctor_id) === String(doc.id) || 
        String(a.doctor_name || '').toLowerCase().includes(doc.name.toLowerCase())
      )

      // Get target phone number (must be doctor's registered phone or fallback)
      const docPhone = doc.phone || ''
      if (!docPhone) {
        console.log(`[WAHA Digest] Skipping doctor ${doc.name}: No mobile number saved in database profile.`)
        details.push({ doctorName: doc.name, status: 'skipped_no_phone' })
        continue
      }

      // Construct WhatsApp Markdown Digest Message dynamically
      let digestMsg = `🌅 *GOOD MORNING ${doc.name.toUpperCase()}!*\n`
      digestMsg += `🗓️ *Daily Patient Briefing - ${formattedTodayDate}*\n`
      digestMsg += `🏢 *Dental Care Clinic*\n`
      digestMsg += `─────────────────────────────\n\n`

      if (docAppts.length === 0) {
        digestMsg += `📋 *Today's Schedule:* No appointments currently scheduled for today.\n`
        digestMsg += `✨ Wish you a pleasant & relaxed day ahead!\n`
      } else {
        digestMsg += `📋 *Today's Total Appointments: ${docAppts.length}*\n\n`

        docAppts.forEach((appt, idx) => {
          const timeLabel = appt.appointment_time || 'Scheduled Slot'
          const patientName = appt.patient_name || appt.name || 'Patient'
          const genderAge = appt.age ? ` (${appt.gender || 'M/F'}, ${appt.age}y)` : ''
          const service = appt.treatment || appt.service_name || appt.reason || 'Dental Consultation'
          const patientPhone = appt.patient_phone || appt.phone || 'N/A'
          const status = appt.status || 'Confirmed'
          const tokenNum = appt.token_number || (appt.id ? appt.id.slice(0, 4) : `#${idx + 1}`)

          digestMsg += `${idx + 1}️⃣ *${timeLabel}* | *${patientName}*${genderAge}\n`
          digestMsg += `   📌 *Treatment:* ${service}\n`
          digestMsg += `   🎟️ *Token:* ${tokenNum} | *Status:* ${status}\n`
          digestMsg += `   📞 *Contact:* ${patientPhone}\n\n`
        })
      }

      digestMsg += `─────────────────────────────\n`
      digestMsg += `📲 *Dental Clinic WhatsApp Notification System*\n`
      digestMsg += `📌 *Powered by WAHA GOWS Engine on Render*`

      // Dispatch via WAHA Engine
      const sendRes = await sendWahaTextMessage({
        phone: docPhone,
        text: digestMsg,
      })

      details.push({
        doctorName: doc.name,
        doctorPhone: docPhone,
        appointmentCount: docAppts.length,
        result: sendRes,
      })

      if (sendRes.success) {
        sentDoctors.push(doc.name)
      }

      // Anti-Ban Protection: Pause 2.5s - 5.0s before processing next recipient
      await delayWithRandomJitter(2500, 5000)
    }

    return {
      success: true,
      count: sentDoctors.length,
      sentDoctors,
      details,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error sending daily doctor appointment digest:', err)
    return {
      success: false,
      count: 0,
      sentDoctors: [],
      details: [{ error: errorMsg }],
    }
  }
}

/**
 * Chatbot Engine Helper: Process incoming WhatsApp messages received via WAHA Webhook.
 * 100% Dynamic: Queries real doctors and clinic branches directly from Supabase!
 */
export async function processWahaIncomingWebhook(payload: Record<string, unknown>): Promise<{
  handled: boolean
  replySent?: boolean
  replyText?: string
}> {
  try {
    const msgData = ((payload.payload || payload) as Record<string, unknown>) || {}
    const incomingText = String(msgData.body || msgData.text || '').trim()
    const fromChatId = String(msgData.from || msgData.chatId || '')

    if (!incomingText || !fromChatId) {
      return { handled: false }
    }

    const adminDb = getAdminSupabase()
    const lowerText = incomingText.toLowerCase()
    let replyText = ''

    if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('namaste') || lowerText === 'start' || lowerText === 'menu') {
      replyText = 
        `🦷 *Welcome to Dental Care Clinic WhatsApp Desk!*\n\n` +
        `How can we assist you today?\n\n` +
        `1️⃣ *Book Appointment* - Reply '1' or 'Book'\n` +
        `2️⃣ *Check Doctor Schedule* - Reply '2' or 'Doctors'\n` +
        `3️⃣ *Clinic Timings & Location* - Reply '3' or 'Info'\n` +
        `4️⃣ *Emergency Support* - Reply '4' or 'Emergency'\n\n` +
        `🌐 Or visit our online portal to book instantly!`
    } else if (lowerText === '1' || lowerText.includes('book')) {
      replyText = 
        `📅 *Book Your Dental Appointment*\n\n` +
        `You can easily schedule your visit with our expert dental team online:\n` +
        `👉 Visit our booking portal to choose your doctor and preferred slot!\n\n` +
        `Or reply with your preferred *Date* & *Doctor Name* to request a callback!`
    } else if (lowerText === '2' || lowerText.includes('doctor') || lowerText.includes('schedule')) {
      // DYNAMIC QUERY: Fetch real doctors from Supabase
      const { data: dbDoctors } = await adminDb
        .from('doctors')
        .select('name, specialty')

      if (dbDoctors && dbDoctors.length > 0) {
        replyText = `👨‍⚕️ *Our Available Dental Specialists:*\n\n`
        dbDoctors.forEach((doc: { name?: string; specialty?: string }) => {
          replyText += `• *${doc.name || 'Doctor'}* - ${doc.specialty || 'Dental Surgeon'}\n`
        })
        replyText += `\n⏰ *Clinic Hours:* Monday to Saturday | 09:00 AM - 08:30 PM`
      } else {
        replyText = 
          `👨‍⚕️ *Dental Specialists*\n` +
          `Please reply with your preferred date to view today's available doctors and slots.`
      }
    } else if (lowerText === '3' || lowerText.includes('info') || lowerText.includes('location')) {
      // DYNAMIC QUERY: Fetch real clinic branches from Supabase
      const { data: dbBranches } = await adminDb
        .from('branches')
        .select('name, address, phone')

      if (dbBranches && dbBranches.length > 0) {
        replyText = `📍 *Dental Care Clinic Locations:*\n\n`
        dbBranches.forEach((b: WahaBranchRecord) => {
          replyText += `🏢 *${b.name}:* ${b.address || 'Medical Center'}\n`
        })
        if (dbBranches[0]?.phone) {
          replyText += `\n📞 *Helpline:* ${dbBranches[0].phone}`
        }
      } else {
        replyText = 
          `📍 *Dental Care Clinic*\n` +
          `Please visit our online portal to view clinic branch locations and helpline numbers!`
      }
    } else if (lowerText === '4' || lowerText.includes('emergency')) {
      replyText = 
        `🚨 *Dental Emergency Hotline*\n\n` +
        `If you are experiencing severe tooth pain, trauma, or bleeding, please contact our emergency hotline immediately or visit our nearest branch!`
    } else {
      replyText = 
        `Thank you for contacting Dental Care Clinic! 🦷\n` +
        `Our team has received your message: "${incomingText}".\n` +
        `A representative or doctor will get back to you shortly.\n\n` +
        `Reply 'MENU' to see available options.`
    }

    // Send chatbot auto-reply back to user via WAHA
    const replyRes = await sendWahaTextMessage({
      phone: fromChatId,
      text: replyText,
    })

    return {
      handled: true,
      replySent: replyRes.success,
      replyText,
    }
  } catch (err: unknown) {
    console.error('[WAHA Webhook Engine Error]:', err)
    return { handled: false }
  }
}

/**
 * Internal helper to insert WAHA message logs into Supabase
 */
async function logWahaMessage(data: {
  recipientPhone: string
  chatId: string
  messageBody: string
  status: string
  responseData?: Record<string, unknown>
}) {
  try {
    const adminDb = getAdminSupabase()
    await adminDb.from('message_logs').insert({
      recipient_name: 'WhatsApp Recipient',
      recipient_phone: data.recipientPhone,
      recipient_email: 'N/A',
      message_type: 'whatsapp_waha_gows',
      message_body: data.messageBody,
      whatsapp_status: data.status,
      email_status: 'skipped',
      sent_at: new Date().toISOString(),
    })
  } catch (err: unknown) {
    console.warn('[WAHA Audit Log Warning]:', err)
  }
}
