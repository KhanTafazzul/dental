import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Lock } from 'lucide-react';
import DentalLogo from '@/components/DentalLogo';

export const metadata: Metadata = {
  title: 'Terms of Service | Dental Clinic Care Network',
  description: 'Terms and conditions governing appointment bookings, patient responsibilities, and clinic services under DPDP Act 2023.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <DentalLogo size={34} />
            <span className="text-base font-serif font-semibold text-white">Dental Clinic Network</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Terms & Conditions of Service</h1>
          <p className="text-xs text-slate-400">Effective Date: September 2026 • Governed by Indian Medical & Healthcare Statutes</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6 text-xs text-slate-300 leading-relaxed shadow-2xl">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" /> 1. Free Appointment Booking Policy
            </h2>
            <p>
              Appointments booked through Hazara Dental Store or Family Dental Store portals are provided free of upfront fees. Patients are required to provide truthful clinical history and contact information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" /> 2. Digital Personal Data Protection (DPDP Act 2023)
            </h2>
            <p>
              By utilizing our booking portal, you consent to the processing of your personal and health data strictly for clinical consultation, diagnostic evaluation, and scheduling. Full rights details can be reviewed in our <Link href="/dpdp" className="text-teal-400 underline">DPDP Compliance Center</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> 3. Practitioner Responsibility & Diagnosis
            </h2>
            <p>
              All clinical examinations, dental prescriptions, and X-ray evaluations are rendered exclusively by licensed dental practitioners assigned to the respective branch.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © 2026 Dental Clinic Network • DPDP Act 2023 Compliant
      </footer>
    </div>
  );
}
