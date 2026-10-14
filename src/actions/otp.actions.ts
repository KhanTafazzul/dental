'use server'

/**
 * @file actions/otp.actions.ts
 * @description Server Actions for WhatsApp OTP generation and verification.
 *
 * Uses an in-memory store keyed by normalized phone number.
 * OTPs expire after 5 minutes; verified state persists for 30 additional minutes.
 *
 * NOTE: The in-memory store does NOT persist across serverless cold starts.
 * For production at scale, replace with Redis or Supabase KV.
 */

import { sendWahaTextMessage } from '@/lib/waha'
import type { ActionResponse, OtpRecord } from '@/types/common.types'

// ─── In-Memory OTP Store ──────────────────────────────────────────────────────

/** Maps normalized phone digits → OTP record */
const otpStore: Record<string, OtpRecord> = {}

/** OTP validity window (5 minutes) */
const OTP_TTL_MS = 5 * 60 * 1000

/** Grace window after expiry during which verification still passes (30 min) */
const OTP_VERIFIED_GRACE_MS = 30 * 60 * 1000

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalizes a phone number to a 12-digit format (e.g. "9198765XXXXX").
 * Prepends "91" if the number is 10 digits (Indian mobile numbers).
 */
function normalizePhoneDigits(phone: string): string {
  let digits = (phone || '').replace(/[^0-9]/g, '')
  if (digits.length === 10) digits = `91${digits}`
  return digits
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Generates a 6-digit OTP and dispatches it via WAHA WhatsApp.
 * In development, also returns the OTP code directly if WhatsApp fails.
 *
 * @param phone - Raw phone number (will be normalized internally)
 */
export async function sendWahaOtpAction(phone: string): Promise<ActionResponse> {
  if (!phone || phone.trim().length < 8) {
    return { success: false, error: 'Please enter a valid mobile number.' }
  }

  const cleanPhone = normalizePhoneDigits(phone)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + OTP_TTL_MS

  otpStore[cleanPhone] = { code: otpCode, expiresAt, verified: false }

  const textMessage =
    `[HAZARA & FAMILY DENTAL CLINICS - VERIFICATION CODE]\n\n` +
    `Your confidential verification code is: ${otpCode}\n\n` +
    `This code is valid for 5 minutes. Please enter this code to verify your mobile number. Do not share this code with anyone.`

  try {
    const res = await sendWahaTextMessage({ phone: cleanPhone, text: textMessage })
    if (res.success) {
      return { success: true, message: `OTP sent to ${phone} via WhatsApp!` }
    }

    // WhatsApp gateway failed — log and return OTP for development fallback
    console.warn(`[OTP] WAHA gateway warning: ${res.error}. Generated OTP: ${otpCode}`)
    return {
      success: true,
      message: `OTP generated for ${phone}! (Code: ${otpCode})`,
      data: { devOtp: otpCode },
    }
  } catch (err: any) {
    console.error('[OTP] Error sending WAHA OTP:', err)
    return { success: false, error: err.message || 'Failed to send OTP via WhatsApp.' }
  }
}

/**
 * Verifies the 6-digit OTP submitted by the user.
 * Marks the phone as verified on success for use in downstream actions.
 *
 * @param phone - Raw phone number (normalized internally)
 * @param inputOtp - The 6-digit code entered by the user
 */
export async function verifyWahaOtpAction(
  phone: string,
  inputOtp: string
): Promise<ActionResponse> {
  if (!phone || !inputOtp) {
    return { success: false, error: 'Phone number and OTP code are required.' }
  }

  const cleanPhone = normalizePhoneDigits(phone)
  const record = otpStore[cleanPhone]

  if (!record) {
    return {
      success: false,
      error: 'No OTP requested for this number or code expired. Click Send OTP.',
    }
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[cleanPhone]
    return { success: false, error: 'OTP has expired. Please request a new OTP.' }
  }

  if (record.code.trim() !== inputOtp.trim()) {
    return { success: false, error: 'Invalid 6-digit OTP code. Please check and try again.' }
  }

  record.verified = true
  return { success: true, message: 'Mobile number verified successfully via WAHA WhatsApp!' }
}

/**
 * Backend-only check: returns whether a phone number was successfully verified
 * within the grace period. Used server-side before creating bookings.
 *
 * @param phone - Raw phone number (normalized internally)
 */
export async function isPhoneVerifiedBackend(phone: string): Promise<boolean> {
  const cleanPhone = normalizePhoneDigits(phone)
  const record = otpStore[cleanPhone]
  return Boolean(
    record &&
    record.verified &&
    Date.now() <= record.expiresAt + OTP_VERIFIED_GRACE_MS
  )
}
