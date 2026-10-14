import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, Globe, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import DentalLogo from '@/components/DentalLogo'

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Protection Notice | DPDP Act 2023',
  description: 'Official clinical privacy policy, patient data rights disclosure, and compliance guidelines under the Digital Personal Data Protection Act, 2023.',
}

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <DentalLogo size={34} />
            <span className="text-sm sm:text-base font-serif font-semibold text-white">Hazara & Family Dental Care</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" /> Statutory Privacy Notice • DPDP Act 2023 & DPDP Rules 2025
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">Privacy and Data Protection Notice</h1>
          <p className="text-xs text-slate-400">Effective Date: January 1, {currentYear} • Issued by Data Protection Officer (DPO)</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-2xl">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" /> 1. Statutory Framework and Data Fiduciary Identity
            </h2>
            <p>
              This Privacy and Data Protection Notice is promulgated in accordance with Sections 5, 6, and 8 of the <em>Digital Personal Data Protection Act, 2023</em> (&ldquo;DPDP Act&rdquo;) read with the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>. The <strong>Hazara & Family Dental Clinics Network</strong> operates as the statutory &ldquo;Data Fiduciary&rdquo; responsible for determining the means and purposes for processing digital personal data.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" /> 2. Categories of Clinical and Personal Data Collected
            </h2>
            <p>
              In delivering specialized dental healthcare services, we gather and process the following classes of personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Patient Demographic Identifiers:</strong> Full legal name, gender, residential address, verified contact telephone number, and electronic mail coordinates.</li>
              <li><strong>Clinical and Health Records:</strong> Systemic medical conditions, medication regimens, recorded drug allergies, intraoral examination findings, periodontal indices, digital photographic records, and radiographic X-ray imagery.</li>
              <li><strong>Diagnostic Prescriptions:</strong> Pharmacological orders issued by licensed attending dental surgeons, dosing instructions, and diagnostic evaluations.</li>
              <li><strong>Financial Ledgers:</strong> Invoicing histories, procedure cost breakdowns, transactional reference identifiers, and payment fulfillment receipts.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> 3. Lawful Basis and Purpose Limitation of Processing
            </h2>
            <p>
              Under Section 6 of the DPDP Act, personal data is processed strictly pursuant to express, informed, specific, and unambiguous patient consent. Processing activities are restricted solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Rendering healthcare assessments, tooth restorations, orthodontic adjustments, and endodontic surgeries.</li>
              <li>Disseminating clinical summary reports, digital prescription copies, and radiographic diagnostic links directly to the patient via encrypted channels (WhatsApp or Email).</li>
              <li>Transmitting automated same-day reporting reminders and scheduled checkup alerts.</li>
              <li>Compliance with statutory medical record archiving mandates pursuant to national healthcare regulations.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> 4. Technical Safeguards and Storage Security
            </h2>
            <p>
              All clinical records and personal identifiers are safeguarded by state-of-the-art technological protections, including AES-256 cryptographic encryption for data at rest, Transport Layer Security (TLS 1.3) protocols for all network communications, multi-tenant row-level database security policies (RLS), and strictly segmented role-based authentication credentials. Third-party commercial marketing or unauthorized data broker disclosures are strictly prohibited.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" /> 5. Data Principal Rights and Redressal Mechanisms
            </h2>
            <p>
              Under Sections 11, 12, and 13 of the DPDP Act, every patient enjoys recognized Data Principal Rights, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Right to Access:</strong> The right to obtain a comprehensive summary of personal data held and processing activities performed.</li>
              <li><strong>Right to Correction & Completion:</strong> The right to update inaccurate, outdated, or incomplete personal identifiers.</li>
              <li><strong>Right to Erasure:</strong> The right to request the permanent deletion of personal profile data, subject to mandatory statutory medical record retention obligations.</li>
              <li><strong>Right to Grievance Redressal:</strong> Dedicated institutional redressal through our designated Data Protection Officer with an operational SLA of seventy-two (72) business hours.</li>
            </ul>
          </section>

          {/* Action Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white block text-sm">Need to Exercise Data Rights or Request Record Erasure?</span>
              <span className="text-[11px] text-slate-300">Submit an official Subject Access Request directly to our compliance desk.</span>
            </div>
            <Link
              href="/dpdp"
              className="px-4 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shrink-0 hover:bg-teal-400 transition-colors"
            >
              Access DPDP Rights Portal
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {currentYear} Hazara & Family Dental Clinics. All rights reserved.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
            <Link href="/dpdp" className="hover:underline">DPDP Compliance</Link>
            <Link href="/support" className="hover:underline">Patient Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
