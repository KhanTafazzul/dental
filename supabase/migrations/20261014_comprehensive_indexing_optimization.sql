-- ==============================================================================
-- COMPREHENSIVE DATABASE & STORAGE INDEXING OPTIMIZATION
-- Purpose: Supercharge read/write query performance across all clinic tables,
--          foreign keys, search patterns, date ranges, and storage objects.
-- Date: 2026-10-14
-- ==============================================================================

-- Enable trgm extension for rapid fuzzy text search if available
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. PATIENTS TABLE INDEXES
-- Optimizes patient phone lookups, email lookups, name searches, and registration dates
CREATE INDEX IF NOT EXISTS idx_patients_mobile ON public.patients (mobile);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients (email);
CREATE INDEX IF NOT EXISTS idx_patients_name_lower ON public.patients (lower(name));
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients (created_at DESC);

-- 2. DOCTORS TABLE INDEXES
-- Optimizes doctor lookup by email, branch assignment, URL slug, and specialty
CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors (email);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors (slug);
CREATE INDEX IF NOT EXISTS idx_doctors_branch_id ON public.doctors (branch_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors (specialty);

-- 3. BRANCHES TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_branches_slug ON public.branches (slug);

-- 4. APPOINTMENTS TABLE INDEXES
-- High-frequency query table: date filtering, status filtering, doctor calendars, patient history
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_branch_id ON public.appointments (branch_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments (appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments (doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON public.appointments (patient_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments (created_at DESC);

-- 5. PRESCRIPTIONS TABLE INDEXES (WYSIWYG & B2 ARCHIVE MODULE)
-- Instant timeline queries for repeat patients, doctor review drawers, and B2 key audits
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions (patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_visit ON public.prescriptions (patient_id, visit_number DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions (doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON public.prescriptions (appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON public.prescriptions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_phone ON public.prescriptions (patient_phone);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_name_lower ON public.prescriptions (lower(patient_name));
CREATE INDEX IF NOT EXISTS idx_prescriptions_delivery_status ON public.prescriptions USING gin (delivery_status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_diagnosis_summary ON public.prescriptions USING gin (diagnosis_summary);

-- 6. INVOICES & BILLING TABLE INDEXES
-- Speeds up financial summaries, patient billing statements, and appointment invoice checks
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON public.invoices (appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices (patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_item_type ON public.invoice_items (item_type);
CREATE INDEX IF NOT EXISTS idx_invoice_items_treatment_id ON public.invoice_items (treatment_id);

-- 7. TREATMENTS TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_treatments_name_lower ON public.treatments (lower(name));

-- 8. ATTENDANCE & EXPENSES INDEXES
CREATE INDEX IF NOT EXISTS idx_doctor_attendance_doc_date ON public.doctor_attendance (doctor_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_helper_attendance_boy_date ON public.helper_attendance (helper_boy_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_extra_expenses_branch_date ON public.extra_expenses (branch_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_branch ON public.monthly_expenses (branch_id, month_year);

-- 9. SUPABASE STORAGE INDEXES (storage.objects)
-- Optimizes reports bucket lookup and signed URL generation
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects (bucket_id, name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects (created_at DESC);

-- Analyze tables to refresh PostgreSQL query planner statistics
ANALYZE public.patients;
ANALYZE public.doctors;
ANALYZE public.branches;
ANALYZE public.appointments;
ANALYZE public.prescriptions;
ANALYZE public.invoices;
ANALYZE public.invoice_items;
