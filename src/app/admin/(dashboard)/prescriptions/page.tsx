import React from 'react'
import { getAdminSupabase } from '@/lib/supabase'
import PrescriptionsClient from './PrescriptionsClient'

export const metadata = {
  title: 'Patient Prescriptions & Archive | Admin Dashboard',
  description: 'Clinic-wide patient prescriptions archive, clinical notes, and prescription PDF generator.',
}

export default async function AdminPrescriptionsPage() {
  const adminDb = getAdminSupabase()
  let consultationPrescriptions: any[] = []

  try {
    const { data, error } = await adminDb
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        prescription_text,
        prescription_url,
        xray_url,
        problem_description,
        patients (id, name, email, mobile, age),
        doctors (id, name, specialty),
        branches (id, name),
        invoices (id, total, created_at, invoice_items (*))
      `)
      .order('appointment_date', { ascending: false })
      .limit(100)

    if (!error && data) {
      // Filter appointments that have prescription advice, prescription url, or invoices with items
      consultationPrescriptions = data.filter((a: any) => 
        a.prescription_text || a.prescription_url || (a.invoices && a.invoices.length > 0)
      )
    }
  } catch (err) {
    console.error('[AdminPrescriptionsPage] Error loading appointments:', err)
  }

  return <PrescriptionsClient initialAppointmentPrescriptions={consultationPrescriptions} />
}
