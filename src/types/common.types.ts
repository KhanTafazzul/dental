/**
 * @file types/common.types.ts
 * @description Shared primitive types and generic response wrappers
 * used throughout the application.
 */

// ─── Generic Server Action Response ──────────────────────────────────────────

/** Standard success/failure response shape for all server actions */
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  [key: string]: any
}

// ─── Domain Primitives ────────────────────────────────────────────────────────

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type CompensationType = 'fixed' | 'percentage'

export type AttendanceStatus = 'present' | 'absent' | 'half_day'

export type InvoiceItemType = 'medicine' | 'treatment' | 'custom'

export type DpdpRequestType = 'access' | 'correction' | 'erasure' | 'withdraw'

export type StockStatus = 'Out of Stock' | 'Low' | 'Medium' | 'High'

export type BranchSlug = 'hazara' | 'family'

// ─── Core Domain Entities ──────────────────────────────────────────────────────

export interface Branch {
  id: string
  name: string
  slug: BranchSlug | string
  working_hours?: string
  camera_passcode?: string
  active_capture_appointment_id?: string | null
  allow_capture_medicine?: boolean
}

export interface Patient {
  id: string
  name: string
  email: string
  mobile: string
  age?: number | string
  dob?: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  slug: string
  specialty?: string
  branch_id?: string
  picture_url?: string
  compensation_type: CompensationType
  fixed_salary: number
  profit_percentage: number
  profit_sharing_target?: string
  password?: string
}

export interface Appointment {
  id: string
  patient_id?: string
  doctor_id?: string
  branch_id?: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  problem_description?: string
  prescription_text?: string
  prescription_url?: string
  xray_url?: string
  temp_mobile_photo?: string | null
  amount_charged?: number
  treatment_cost?: number
  report_sent_at?: string
  // Joined relations
  patients?: Patient
  doctors?: Doctor
  branches?: Branch
}

export interface Treatment {
  id: string
  name: string
  price: number
  cost: number
}

export interface TimeSlot {
  id: string
  time_value: string
  time_label: string
}

// ─── Inventory / Medicines ────────────────────────────────────────────────────

export interface MedicineBatch {
  id: string
  medicine_id: string
  batch_number: string
  expiry_date: string
  price: number
  cost_price: number
  mrp: number
  stock: number
  branch_slug?: string
}

export interface Medicine {
  id: string
  name: string
  generic_name?: string
  barcode?: string
  tablets_per_patch: number
  stock: number
  batches?: MedicineBatch[]
  // Inventory-enriched fields (from getInventoryItems)
  unitPrice?: number
  costPrice?: number
  mrpPrice?: number
  category?: string
  supplier?: string
  reorderLevel?: number
  stockStatus?: StockStatus
}

// ─── Billing / Finance ────────────────────────────────────────────────────────

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  type: InvoiceItemType
  item_type?: InvoiceItemType
  name: string
  custom_name?: string
  quantity: number
  price: number
  unit_price?: number
  total_price?: number
  medicine_id?: string
  treatment_id?: string
  /** Batch ID to deduct from — overrides FIFO if specified */
  batchId?: string
}

export interface Invoice {
  id: string
  appointment_id: string
  patient_id: string
  subtotal: number
  discount_percentage: number
  treatment_discount_percentage?: number
  medicine_discount_percentage?: number
  total: number
  created_at: string
  // Relations
  patients?: Patient
  appointments?: Appointment
  invoice_items?: InvoiceItem[]
}

export interface InvoiceDetails {
  invoiceId: string
  date: string
  branchName: string
  doctorName: string
  patientName: string
  patientAge: string | number
  patientMobile: string
  patientEmail: string
  items: InvoiceItem[]
  subtotal: number
  treatmentSubtotal: number
  treatmentDiscountPercent: number
  treatmentDiscountVal: number
  medicineSubtotal: number
  medicineDiscountPercent: number
  medicineDiscountVal: number
  totalDiscountSaved: number
  overallDiscountPercent: number
  grandTotal: number
}

// ─── Finance / Staff ─────────────────────────────────────────────────────────

export interface HelperBoy {
  id: string
  name: string
  shift_1_rate: number
  shift_2_rate: number
  shift_1_enabled: boolean
  shift_2_enabled: boolean
  sunday_enabled: boolean
  branch_id: string
}

export interface HelperAttendance {
  helper_boy_id: string
  date: string
  shift: number
  status: AttendanceStatus
}

export interface DoctorAttendance {
  doctor_id: string
  date: string
  status: AttendanceStatus
}

export interface MonthlyExpense {
  id: string
  branch_id: string
  month_year: string
  electricity_bill: number
}

export interface ExtraExpense {
  id: string
  amount: number
  note: string
  expense_date: string
  branch_id: string | null
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export interface MessageLog {
  id: string
  recipient_name?: string
  recipient_phone?: string
  recipient_email?: string
  message_type: string
  status: 'sent' | 'failed' | 'pending'
  sent_at: string
}

// ─── DPDP / Compliance ────────────────────────────────────────────────────────

export interface DpdpRequest {
  id?: string
  ticket_id: string
  request_type: DpdpRequestType | string
  full_name: string
  email: string
  phone?: string
  branch?: string
  category?: string
  details?: string
  status: string
  submitted_at: string
  admin_notes?: string | null
}

// ─── OTP Store ────────────────────────────────────────────────────────────────

export interface OtpRecord {
  code: string
  expiresAt: number
  verified: boolean
}
