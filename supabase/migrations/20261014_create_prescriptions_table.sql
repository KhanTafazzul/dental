-- Migration: Create Prescriptions Table & Repeat-Visit History Tracking
-- Architecture: WYSIWYG Template Mapper, B2 Cloud Storage & WAHA / Email Engine
-- Date: 2026-10-14

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    visit_number INTEGER NOT NULL DEFAULT 1,
    b2_object_key TEXT NOT NULL,
    file_size_kb INTEGER NOT NULL DEFAULT 0,
    original_size_bytes INTEGER NOT NULL DEFAULT 0,
    compressed_size_bytes INTEGER NOT NULL DEFAULT 0,
    diagnosis_summary JSONB DEFAULT '{}'::jsonb,
    delivery_status JSONB DEFAULT '{"whatsapp": "pending", "email": "pending"}'::jsonb,
    patient_name TEXT,
    patient_phone TEXT,
    patient_email TEXT,
    doctor_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indices for instant history retrieval & filtering
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id, visit_number DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON public.prescriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_delivery_status ON public.prescriptions USING gin (delivery_status);

-- Function to atomically compute the next visit number for repeat patients
CREATE OR REPLACE FUNCTION public.get_next_patient_visit_number(p_patient_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_next_visit INTEGER;
BEGIN
    SELECT COALESCE(MAX(visit_number), 0) + 1
    INTO v_next_visit
    FROM public.prescriptions
    WHERE patient_id = p_patient_id;
    
    RETURN v_next_visit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Restrict to authenticated clinic staff; service role bypasses RLS
DROP POLICY IF EXISTS "Allow public read access to prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow public insert of prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow admin full access to prescriptions" ON public.prescriptions;

CREATE POLICY "Allow authenticated full access to prescriptions" ON public.prescriptions
    FOR ALL TO authenticated USING (true);
