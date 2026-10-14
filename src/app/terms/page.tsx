"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Lock, Scale, AlertCircle } from "lucide-react";
import DentalLogo from "@/components/DentalLogo";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { LegalDocSkeleton } from "@/components/skeletons/LegalDocSkeleton";

function TermsContent() {
  const currentYear = new Date().getFullYear();
  const EFFECTIVE_DATE = "January 1, 2026";

  return (
    <div className="min-h-screen bg-[#F5F7F3] dark:bg-[#0F150D] text-[#1C2618] dark:text-[#E2E8DC] blueprint-grid flex flex-col justify-between transition-colors overflow-x-hidden w-full max-w-full">
      <header className="sticky top-0 z-40 bg-[#F5F7F3]/80 dark:bg-[#0F150D]/80 backdrop-blur-2xl border-b border-white/40 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <DentalLogo size={34} />
            <span className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3]">
              Hazara & Family Dental Clinics
            </span>
          </Link>
          <Link href="/">
            <AntigravityButton variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Return Home
            </AntigravityButton>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <TelemetryBadge label="Legal Framework & Clinical Terms" code="DPDP-2023-STATUTE" variant="olive" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1C2618] dark:text-[#F5F7F3]">
            Terms and Conditions of Clinical Service
          </h1>
          <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">
            Effective Date: {EFFECTIVE_DATE} • Governed by the Dentists Act, 1948 and Digital Personal Data Protection Act, 2023
          </p>
        </div>

        <AppleLiquidCard variant="light" className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#556B4B]" /> 1. Preamble and Binding Agreement
            </h2>
            <p>
              These Terms and Conditions of Clinical Service (&ldquo;Terms&rdquo;) constitute a legally enforceable electronic contract executed between the patient, their authorized parent or legal guardian (&ldquo;Patient&rdquo;, &ldquo;User&rdquo;, or &ldquo;You&rdquo;), and <strong>Hazara & Family Dental Clinics Network</strong> (&ldquo;Clinic&rdquo;, &ldquo;Practitioner&rdquo;, &ldquo;We&rdquo;, or &ldquo;Us&rdquo;). By accessing the clinical booking portal, registering a patient credential, scheduling consultations, or authorizing treatment at either the Hazara Dental Clinic or Family Dental Clinic facilities, you unconditionally covenant to be bound by all covenants, representations, warranties, and disclosures set forth herein.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#556B4B]" /> 2. Scope of Clinical Services and Practitioner Autonomy
            </h2>
            <p>
              The digital portal facilitates appointment allocation, clinical queue coordination, diagnostic communication, and billing synchronization. All medical evaluations, radiographic examinations, periodontal procedures, restorative surgeries, and orthodontic prescriptions are rendered strictly by autonomous, registered dental practitioners duly licensed under the Dental Council of India and applicable state councils. The allocation of an electronic slot does not guarantee a predetermined surgical procedure; the attending clinician retains absolute medical discretion to decline, modify, or recommend alternate clinical interventions pursuant to in-person diagnostic examination.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#556B4B]" /> 3. Patient Obligations, Veracity of Medical History & Emergency Disclaimer
            </h2>
            <p>
              You affirm that all information tendered during registration, including full legal name, date of birth, contact telephone numbers, systemic illnesses (including cardiovascular conditions, diabetes, bleeding disorders, and hypertension), active medications (particularly anticoagulants or bisphosphonates), and recognized allergies (such as penicillin or local anesthetics), is accurate, current, and exhaustive. The Clinic disclaims all liability arising from adverse clinical incidents caused by omitted or inaccurate patient disclosures.
            </p>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
              <strong>Emergency Care Notice:</strong> This digital scheduling platform is designed solely for elective and scheduled clinical appointments. In the event of severe traumatic facial injury, acute airway obstruction, uncontrolled post-extraction hemorrhage, or rapidly spreading deep fascial space infections, you are instructed to immediately seek emergency care at the nearest hospital trauma center.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#556B4B]" /> 4. Appointment Coordination, Electronic Tokens & Cancellation Protocol
            </h2>
            <p>
              Online appointment booking is provided free of advance administrative deposit. Scheduled arrival times represent designated reporting checkpoints. While the Clinic employs modern queue-optimization software, procedural complexities with preceding patients or acute trauma walk-ins may necessitate schedule adjustments. Patients unable to attend their scheduled consultation must notify the Clinic or cancel the slot via the portal at least two (2) hours prior to the slot. Repeated unauthorized absences may result in temporary suspension of digital booking privileges.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#556B4B]" /> 5. Treatment Fees, Invoicing & Financial Settlement
            </h2>
            <p>
              Treatment fees, including radiographic diagnostic charges, dental consumables, prosthetic fabrications, and pharmacological supplies, are calculated based on the prevailing clinical fee schedule published at the respective branch. Digital invoices generated at the conclusion of an appointment are due upon receipt. Payments may be tendered via cash, unified payment interface (UPI), point-of-sale debit/credit terminals, or designated electronic gateways. All issued itemized invoices are conclusive of charges rendered.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#556B4B]" /> 6. Data Protection, Consent & DPDP Act 2023 Compliance
            </h2>
            <p>
              In strict adherence to the <em>Digital Personal Data Protection Act, 2023</em> (DPDP Act) and the <em>Information Technology Act, 2000</em>, your personal identifiers and clinical data are processed exclusively for healthcare diagnostic delivery, statutory record maintenance, and direct appointment notifications via encrypted SMS or WhatsApp messaging. The Clinic enforces rigorous administrative and technological safeguards, including role-based access control and encrypted database storage. Detailed rights regarding Data Subject Access, Correction, and Erasure are governed by our <Link href="/privacy" className="text-[#556B4B] underline font-semibold">Privacy Policy</Link> and the dedicated <Link href="/dpdp" className="text-[#556B4B] underline font-semibold">DPDP Portal</Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#556B4B]" /> 7. Limitation of Liability, Indemnity & Jurisdiction
            </h2>
            <p>
              To the maximum extent permitted under applicable law, the Clinic, its directors, and clinical staff shall not be liable for any indirect, incidental, or consequential damages resulting from digital portal downtime, third-party network interruptions, or failure of telecommunication dispatch gateways. Any legal cause of action, dispute, or claim arising out of or in connection with clinical services rendered or these Terms shall be subject to the exclusive jurisdiction of the competent civil courts located in the district where the clinical facility is situate.
            </p>
          </section>
        </AppleLiquidCard>
      </main>

      <footer className="border-t border-[#A3B799]/30 py-6 text-center text-xs text-[#556B4B] dark:text-[#A3B799]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {currentYear} Hazara & Family Dental Clinics. All rights reserved.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
            <Link href="/dpdp" className="hover:underline">DPDP Rights</Link>
            <Link href="/support" className="hover:underline">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function TermsPage() {
  return (
    <ProgressiveLoader skeleton={<LegalDocSkeleton />}>
      <TermsContent />
    </ProgressiveLoader>
  );
}
