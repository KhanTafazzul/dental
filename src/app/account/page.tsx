import React from 'react'
import PatientAccountPortal from '@/components/patient/PatientAccountPortal'
import Link from 'next/link'
import DentalLogo from '@/components/DentalLogo'

export const metadata = {
  title: 'My Patient Account & Settings | Falix Dental Care',
  description: 'Manage your patient profile, contact details, medical history, linked accounts, and privacy settings.',
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06120f] via-[#0b1f1a] to-[#040c0a] text-white selection:bg-emerald-500/30 selection:text-emerald-200 py-8 px-4 sm:px-8">
      
      {/* Header Bar */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <DentalLogo iconOnly={false} size={36} />
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          ← Return to Clinic Gateway
        </Link>
      </div>

      <PatientAccountPortal />
    </div>
  )
}
