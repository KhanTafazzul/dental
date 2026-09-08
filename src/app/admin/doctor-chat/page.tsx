import React from 'react'
import { getAdminSupabase } from '@/lib/supabase'
import DoctorChatPortal from '@/components/chat/DoctorChatPortal'
import { MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Doctor Consultations & Case Referrals | Admin Panel',
  description: 'Inter-doctor messaging portal for sharing patient reports, clinical cases, and treatment bills.',
}

export default async function AdminDoctorChatPage() {
  const adminDb = getAdminSupabase()
  let doctors: any[] = []
  let appointments: any[] = []

  try {
    const [docRes, apptRes] = await Promise.all([
      adminDb.from('doctors').select('id, name, slug, specialty, branch_id, branches(name)').order('name'),
      adminDb.from('appointments').select(`
        id,
        appointment_date,
        prescription_text,
        prescription_url,
        xray_url,
        patients (id, name),
        doctors (id, name),
        invoices (id, total, subtotal)
      `).order('appointment_date', { ascending: false }).limit(20)
    ])

    doctors = (docRes.data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      specialty: d.specialty || 'General Dentist',
      branchName: d.branches?.name || 'Hazara Clinic',
      isOnline: true
    }))

    appointments = apptRes.data || []
  } catch (err) {
    console.error('Error fetching data for doctor chat:', err)
  }

  // Fallback doctors list if empty
  if (doctors.length === 0) {
    doctors = [
      { id: 'doc-1', name: 'Dr. Sarah Jenkins', slug: 'sarah-jenkins', specialty: 'Orthodontics & Implants', branchName: 'Hazara Clinic', isOnline: true },
      { id: 'doc-2', name: 'Dr. A. K. Khan', slug: 'ak-khan', specialty: 'Endodontist & Root Canal Specialist', branchName: 'Family Dental Clinic', isOnline: true },
      { id: 'doc-3', name: 'Dr. Neha Sharma', slug: 'neha-sharma', specialty: 'Pediatric Dentistry & Cosmetic Teeth Whitening', branchName: 'Hazara Clinic', isOnline: false }
    ]
  }

  const currentUser = {
    id: 'admin-owner',
    name: 'Clinic Admin / Owner',
    role: 'admin' as const
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-slate-900 font-normal flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            Doctor Consultations & Case Referrals
          </h1>
          <p className="text-xs text-slate-400 font-light uppercase tracking-wider mt-1">
            Real-time Doctor-to-Doctor Messaging, Patient Report & Invoice Sharing
          </p>
        </div>
      </div>

      <DoctorChatPortal
        currentUser={currentUser}
        doctorsList={doctors}
        appointments={appointments}
      />
    </div>
  )
}
