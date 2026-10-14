/**
 * @file env.ts
 * @description Centralized environment configuration with startup validation.
 *
 * ALL environment variable access throughout the application must go through
 * this module. Never read `process.env` directly in business logic or components.
 *
 * - Public (NEXT_PUBLIC_*) vars are safe to use on the client.
 * - Server-only vars (no NEXT_PUBLIC_ prefix) are ONLY available server-side.
 */

// ─── Public Client-Safe Config ──────────────────────────────────────────────

export const ENV = {
  // ── Supabase ──────────────────────────────────────────────────────────────
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',

  // ── Firebase ──────────────────────────────────────────────────────────────
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',

  // ── App Info ───────────────────────────────────────────────────────────────
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const

// ─── Server-Only Config ──────────────────────────────────────────────────────
// These are only accessible in server-side code (Server Actions, Route Handlers, middleware).

export const SERVER_ENV = {
  // ── Supabase Service Role ─────────────────────────────────────────────────
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // ── Admin Auth ────────────────────────────────────────────────────────────
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || '',

  // ── TiDB / MySQL ──────────────────────────────────────────────────────────
  TIDB_HOST: process.env.TIDB_HOST || '',
  TIDB_PORT: parseInt(process.env.TIDB_PORT || '4000', 10),
  TIDB_USER: process.env.TIDB_USER || '',
  TIDB_PASSWORD: process.env.TIDB_PASSWORD || '',
  TIDB_DATABASE: process.env.TIDB_DATABASE || 'test',

  // ── WAHA WhatsApp ─────────────────────────────────────────────────────────
  WAHA_ENDPOINT: process.env.WAHA_ENDPOINT || '',
  WAHA_API_KEY: process.env.WAHA_API_KEY || '',
  WAHA_SESSION: process.env.WAHA_SESSION || 'whatsappp-api-dental',

  // ── Email (Brevo) ─────────────────────────────────────────────────────────
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'dental@flynx.site',

  // ── Email (Resend) ────────────────────────────────────────────────────────
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',

  // ── Backblaze B2 (S3-Compatible Private Storage) ───────────────────────────
  B2_ENDPOINT: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  B2_KEY_ID: process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID || '',
  B2_APP_KEY: process.env.B2_APP_KEY || process.env.B2_APPLICATION_KEY || '',
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || 'dental-hazara',
  B2_REGION: process.env.B2_REGION || 'us-east-005',
} as const

// ─── Startup Validation (Server-Side Only) ───────────────────────────────────

/**
 * Validates that all required environment variables are present.
 * Call this in layout.tsx or at app startup to catch misconfigurations early.
 * @returns { valid: boolean; missing: string[] }
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required: Array<{ key: string; value: string }> = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: ENV.SUPABASE_URL },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: ENV.SUPABASE_ANON_KEY },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: SERVER_ENV.SUPABASE_SERVICE_ROLE_KEY },
    { key: 'ADMIN_PASSWORD', value: SERVER_ENV.ADMIN_PASSWORD },
  ]

  const missing = required
    .filter(({ value }) => !value || value.startsWith('placeholder'))
    .map(({ key }) => key)

  if (missing.length > 0) {
    console.warn(
      `[ENV] Warning: Missing or placeholder environment variables detected:\n${missing.map(k => `  - ${k}`).join('\n')}\nSee .env.local.example for reference.`
    )
  }

  return { valid: missing.length === 0, missing }
}
