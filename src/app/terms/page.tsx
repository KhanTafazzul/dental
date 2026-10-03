"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Lock } from "lucide-react";
import DentalLogo from "@/components/DentalLogo";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { LegalDocSkeleton } from "@/components/skeletons/LegalDocSkeleton";

function TermsContent() {
  return (
    <div className="min-h-screen bg-[#F5F7F3] dark:bg-[#0F150D] text-[#1C2618] dark:text-[#E2E8DC] blueprint-grid flex flex-col justify-between transition-colors">
      <header className="sticky top-0 z-40 bg-[#F5F7F3]/70 dark:bg-[#0F150D]/70 backdrop-blur-2xl border-b border-white/40 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <DentalLogo size={34} />
            <span className="text-base font-bold text-[#1C2618] dark:text-[#F5F7F3]">Terms of Service</span>
          </Link>
          <Link href="/">
            <AntigravityButton variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Back Home
            </AntigravityButton>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <TelemetryBadge label="Legal Compliance" code="DPDP-2023" variant="olive" />
          <h1 className="text-3xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">Terms & Conditions of Service</h1>
          <p className="text-xs text-[#556B4B]">Effective Date: October 2026 • Governed by Healthcare Statutes</p>
        </div>

        <AppleLiquidCard variant="light" className="p-8 space-y-6 text-xs leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#556B4B]" /> 1. Free Appointment Booking Policy
            </h2>
            <p className="text-[#556B4B]">
              Appointments booked through Hazara Dental Clinic or Family Dental Clinic portals are provided free of upfront fees. Patients are required to provide truthful clinical history and contact information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#556B4B]" /> 2. Digital Personal Data Protection (DPDP Act 2023)
            </h2>
            <p className="text-[#556B4B]">
              By utilizing our booking portal, you consent to the processing of your personal and health data strictly for clinical consultation, diagnostic evaluation, and scheduling.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#556B4B]" /> 3. Practitioner Responsibility & Diagnosis
            </h2>
            <p className="text-[#556B4B]">
              All clinical examinations, dental prescriptions, and X-ray evaluations are rendered exclusively by licensed dental practitioners assigned to the respective branch.
            </p>
          </section>
        </AppleLiquidCard>
      </main>

      <footer className="border-t border-[#A3B799]/30 py-6 text-center text-xs text-[#556B4B]">
        © 2026 Dental Clinic Network • DPDP Act 2023 Compliant
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
