/**
 * @file routes.ts
 * @description Centralised application route constants.
 *
 * Use these constants everywhere instead of hardcoded string paths.
 * This prevents broken links when routes change and enables easy refactoring.
 */

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────────────
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SUPPORT: '/support',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  DPDP: '/dpdp',

  // ── Patient Branches ───────────────────────────────────────────────────────
  HAZARA: '/hazara',
  HAZARA_BOOK: '/hazara/book',
  HAZARA_SUCCESS: '/hazara/book/success',
  FAMILY: '/family',
  FAMILY_BOOK: '/family/book',
  FAMILY_SUCCESS: '/family/book/success',

  // ── Patient Account ───────────────────────────────────────────────────────
  ACCOUNT: '/account',

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_CAPTURE: '/admin/capture',
  ADMIN_APPOINTMENTS: '/admin',
  ADMIN_DOCTORS: '/admin/doctors',
  ADMIN_BILLING: '/admin/billing',
  ADMIN_FINANCES: '/admin/finances',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_MESSAGING: '/admin/messaging',
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_PRESCRIPTION_MAPPER: '/admin/prescription-mapper',
  ADMIN_DOCTOR_CHAT: '/admin/doctor-chat',

  // ── Doctor Portal ──────────────────────────────────────────────────────────
  DOCTOR: '/doctor',
  DOCTOR_LOGIN: '/doctor/login',
  DOCTOR_PORTAL: (slug: string) => `/doctor/${slug}` as const,
  DOCTOR_EARNINGS: (slug: string) => `/doctor/${slug}/earnings` as const,

  // ── API ───────────────────────────────────────────────────────────────────
  API_WHATSAPP_SEND: '/api/whatsapp/send',
  API_WHATSAPP_WEBHOOK: '/api/whatsapp/webhook',
  API_WHATSAPP_DIGEST: '/api/whatsapp/morning-digest',
} as const

/** Auth cookie names used across the app */
export const COOKIES = {
  ADMIN_TOKEN: 'dental_admin_token',
  DOCTOR_TOKEN: 'dental_doctor_token',
} as const

/** Supabase table names (single source of truth) */
export const TABLES = {
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  BRANCHES: 'branches',
  TIME_SLOTS: 'time_slots',
  INVOICES: 'invoices',
  INVOICE_ITEMS: 'invoice_items',
  TREATMENTS: 'treatments',
  HELPER_BOYS: 'helper_boys',
  HELPER_ATTENDANCE: 'helper_attendance',
  DOCTOR_ATTENDANCE: 'doctor_attendance',
  MONTHLY_EXPENSES: 'monthly_expenses',
  EXTRA_EXPENSES: 'extra_expenses',
  MESSAGE_LOGS: 'message_logs',
  DPDP_REQUESTS: 'dpdp_requests',
} as const

/** Supabase storage bucket names */
export const STORAGE_BUCKETS = {
  REPORTS: 'reports',
} as const
