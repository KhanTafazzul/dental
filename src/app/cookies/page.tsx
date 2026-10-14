"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, ShieldCheck, Lock, Sliders, Database, AlertCircle } from "lucide-react";
import DentalLogo from "@/components/DentalLogo";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { LegalDocSkeleton } from "@/components/skeletons/LegalDocSkeleton";

function CookiePolicyContent() {
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
          <TelemetryBadge label="Statutory Disclosure & Policy" code="COOKIE-DPDP-2023" variant="olive" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1C2618] dark:text-[#F5F7F3]">
            Cookie & Local Data Storage Policy
          </h1>
          <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">
            Effective Date: {EFFECTIVE_DATE} • Formulated pursuant to the Digital Personal Data Protection Act, 2023 & Information Technology Rules, 2011
          </p>
        </div>

        <AppleLiquidCard variant="light" className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Cookie className="w-4 h-4 text-[#556B4B]" /> 1. Statutory Scope and Regulatory Statement
            </h2>
            <p>
              This Cookie and Local Data Storage Policy (&ldquo;Policy&rdquo;) sets forth the formal regulatory, technical, and operational disclosures of <strong>Hazara & Family Dental Clinics Network</strong> (&ldquo;Data Fiduciary&rdquo;, &ldquo;Clinic&rdquo;, &ldquo;We&rdquo;, or &ldquo;Us&rdquo;) concerning the deployment, storage, lifespan, and processing of HTTP cookies, HTML5 local storage artifacts, session tokens, and cryptographic identifiers on your computing device, smartphone, or tablet (&ldquo;Terminal Equipment&rdquo;).
            </p>
            <p>
              In strict adherence to <strong>Section 5 and Section 6 of the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act 2023&rdquo;)</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, non-essential cookies and client-side profiling scripts remain disabled by default and are never loaded onto your device unless affirmative, voluntary, specific, and unbundled consent is recorded through our Consent Management Architecture.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#556B4B]" /> 2. Classification of Tracking & Storage Mechanisms
            </h2>
            <p>
              Our clinical digital infrastructure employs an austere, data-minimized taxonomy of storage mechanisms categorized into three distinct operational tiers:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-[#1C2618] dark:text-[#F5F7F3] mb-1">Tier A: Strictly Necessary & Security Cookies (Exempt from Optional Consent)</h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Strictly Necessary Cookies are indispensable for enabling authentication sessions, CSRF token validation, cryptographic signature verification, load balancing, and patient account access (e.g., <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">dental_admin_token</code>, <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">dental_doctor_token</code>, <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">dental_patient_token</code>). These cookies are configured with the <code className="text-emerald-600 dark:text-emerald-400 font-semibold">HttpOnly</code>, <code className="text-emerald-600 dark:text-emerald-400 font-semibold">Secure</code>, and <code className="text-emerald-600 dark:text-emerald-400 font-semibold">SameSite=Lax</code> security attributes. They do not harvest diagnostic data or monitor browsing conduct outside of this clinical portal.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-[#1C2618] dark:text-[#F5F7F3] mb-1">Tier B: Functional & Clinic Preference Storage (Subject to Voluntary Consent)</h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Functional storage stores client-side preferences solely to enhance your clinical booking journey, such as your selected default branch (Hazara Dental Clinic or Family Dental Clinic), preferred diagnostic language (e.g., English, Hindi, Urdu), UI theme display settings, and active step persistence in multi-stage appointment forms. You retain full autonomy to accept or decline this tier without jeopardizing access to emergency care.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-[#1C2618] dark:text-[#F5F7F3] mb-1">Tier C: Anonymized Clinical Telemetry & Performance (Disabled by Default)</h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Aggregated telemetry facilitates technical latency measurement, server uptime diagnostics, and front-end render performance monitoring. All metrics are de-identified at ingestion. Under no circumstances do we deploy behavioral advertising cookies, commercial ad retargeting pixels, or third-party data broker SDKs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#556B4B]" /> 3. Data Retention Lifecycle & Cryptographic Safeguards
            </h2>
            <p>
              Session tokens are automatically invalidated upon portal logout or following 720 minutes of session inactivity. Preference keys stored within client-side localStorage persist for an upper limit of 365 calendar days unless cleared proactively by the Data Principal. All patient authorization cookies are generated using HMAC-SHA256 signature digests and verified server-side on every request cycle to prevent cross-site request forgery, session hijacking, or identity spoofing.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#556B4B]" /> 4. Prohibition of Minor Tracking & Behavioral Advertising
            </h2>
            <p>
              In strict conformity with <strong>Section 9(3) of the DPDP Act, 2023</strong>, Hazara & Family Dental Clinics Network explicitly prohibits any tracking, behavioral monitoring, or targeted marketing directed at children or minors seeking pediatric oral care. Parental or guardian consent recorded during appointment creation strictly covers clinical delivery and triage notifications, never commercial analytics or cross-site behavioral profiles.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#556B4B]" /> 5. Consent Revocation & Terminal Management
            </h2>
            <p>
              Pursuant to <strong>Section 6(4) of the DPDP Act 2023</strong>, you possess the statutory right to withdraw your consent to functional and analytical cookies at any time with the same ease with which consent was initially granted. You may exercise this right by:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
              <li>Accessing the floating Cookie Preferences control panel present in the lower perimeter of our digital portal.</li>
              <li>Clearing your web browser&rsquo;s cache and localized site data via your browser security settings (e.g., Chrome, Safari, Firefox, Edge).</li>
              <li>Configuring terminal-level Do-Not-Track (DNT) or Global Privacy Control (GPC) headers, which our infrastructure respects unconditionally.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#556B4B]" /> 6. Grievance Redressal Officer Contact Details
            </h2>
            <p>
              If you have queries, complaints, or legal notices concerning the administration of cookies or localized processing under this Policy, you may contact our designated Data Protection Officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
              <p><strong>Designation:</strong> Data Protection & Grievance Redressal Officer</p>
              <p><strong>Entity:</strong> Hazara & Family Dental Clinics Data Governance Office</p>
              <p><strong>Email Address:</strong> <a href="mailto:privacy@flynx.site" className="text-[#556B4B] dark:text-[#A3B799] underline font-medium">privacy@flynx.site</a></p>
              <p><strong>Clinical Helpline:</strong> <a href="tel:+919820012345" className="text-[#556B4B] dark:text-[#A3B799] underline font-medium">+91 98200 12345</a></p>
              <p><strong>Statutory Response Window:</strong> Acknowledged within 24 hours; resolved within 7 business days.</p>
            </div>
          </section>
        </AppleLiquidCard>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500">
          <p>© {currentYear} Hazara & Family Dental Clinics. All statutory rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#556B4B] dark:hover:text-[#A3B799] transition">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[#556B4B] dark:hover:text-[#A3B799] transition">
              Privacy Policy
            </Link>
            <Link href="/dpdp" className="hover:text-[#556B4B] dark:hover:text-[#A3B799] transition">
              DPDP Compliance
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <ProgressiveLoader skeleton={<LegalDocSkeleton />}>
      <CookiePolicyContent />
    </ProgressiveLoader>
  );
}
