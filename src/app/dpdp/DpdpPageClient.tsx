"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowLeft,
  Send,
  RefreshCw,
  Building2,
  UserCheck,
  Shield,
  Loader2,
} from "lucide-react";
import { DPDP_TRANSLATIONS, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/dpdpTranslations";
import { submitDpdpRequest } from "@/app/admin/actions";
import DentalLogo from "@/components/DentalLogo";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { LegalDocSkeleton } from "@/components/skeletons/LegalDocSkeleton";

function DpdpPageClientContent() {
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [activeSection, setActiveSection] = useState<"overview" | "rights" | "sar" | "dpo">("overview");

  const [requestType, setRequestType] = useState<"access" | "correction" | "erasure" | "withdraw">("access");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = DPDP_TRANSLATIONS[lang] || DPDP_TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const handleSarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Please enter your full name and email address.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitDpdpRequest({
        requestType,
        fullName,
        email,
        phone,
        details,
        language: lang,
      });

      if (res.success) {
        setTicketId(res.ticketId);
      } else {
        setErrorMsg("Failed to process request. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F3] dark:bg-[#0F150D] text-[#1C2618] dark:text-[#E2E8DC] blueprint-grid flex flex-col justify-between transition-colors font-sans">
      <header className="sticky top-0 z-40 bg-[#F5F7F3]/70 dark:bg-[#0F150D]/70 backdrop-blur-2xl border-b border-white/40 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <DentalLogo size={34} />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#1C2618] dark:text-[#F5F7F3]">Dental Clinic Network</span>
              <TelemetryBadge label="MEITY DPDP 2023" code="SCHEDULE II" variant="olive" className="scale-90 -ml-1" />
            </div>
          </Link>
          <Link href="/">
            <AntigravityButton variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Clinic
            </AntigravityButton>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-8" dir={currentLangObj.dir}>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <TelemetryBadge label="Digital Personal Data Protection Act 2023" code="RULE 4 VERIFIED" variant="sage" />
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">{t.consentNoticeTitle}</h1>
          <p className="text-sm text-[#556B4B]">{t.consentNoticeDesc || "Protecting patient clinical privacy, data subject rights, and medical records under Indian law."}</p>

          <div className="mt-4 inline-flex items-center gap-3 p-2 bg-[#E2E8DC]/80 dark:bg-[#1C2618]/80 border border-[#A3B799]/40 rounded-2xl">
            <Globe className="w-4 h-4 text-[#556B4B]" />
            <span className="text-xs font-semibold text-[#1C2618] dark:text-[#F5F7F3]">Language:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-bold text-[#1C2618] dark:text-[#F5F7F3] focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#1C2618] text-white">
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#E2E8DC]/70 dark:bg-[#1C2618]/70 border border-[#A3B799]/30">
          {[
            { id: "overview", label: "Schedule II Notice" },
            { id: "rights", label: "Data Principal Rights" },
            { id: "sar", label: "Exercise Rights Form" },
            { id: "dpo", label: "DPO & Grievance" },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeSection === sec.id
                  ? "bg-[#2C3A27] text-[#F5F7F3] shadow-md"
                  : "text-[#556B4B] hover:text-[#1C2618]"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        {activeSection === "overview" && (
          <AppleLiquidCard variant="light" className="p-8 space-y-6 text-xs leading-relaxed">
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#556B4B]" /> {t.noticeHeading || "1. Data Collection & Purpose"}
              </h2>
              <p className="text-[#556B4B]">{t.noticeBody || "Personal and health data (Name, DOB, Phone, Dental History, X-Rays) are processed exclusively for appointment scheduling, diagnosis, treatment, and billing."}</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#556B4B]" /> 2. Storage & Retention Policy
              </h2>
              <p className="text-[#556B4B]">Medical records are preserved in encrypted Supabase storage for the statutory retention period under Indian healthcare regulations.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#556B4B]" /> 3. Section 9(3) Children Data Protection
              </h2>
              <p className="text-[#556B4B]">Behavioral tracking and targeted advertising on minors are strictly prohibited.</p>
            </div>
          </AppleLiquidCard>
        )}

        {activeSection === "sar" && (
          <AppleLiquidCard variant="light" className="p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3]">Data Principal Subject Access Request (SAR)</h2>
              <p className="text-xs text-[#556B4B]">Submit a request to access, correct, erase your data, or withdraw consent.</p>
            </div>

            {ticketId ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                <h3 className="font-bold text-base">Request Submitted Successfully</h3>
                <p className="text-xs font-mono">Ticket Ref ID: {ticketId}</p>
                <p className="text-xs">Our Data Protection Officer will review and process your request within statutory timelines.</p>
              </div>
            ) : (
              <form onSubmit={handleSarSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#556B4B]">Request Type</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none"
                  >
                    <option value="access">Access Personal Data Summary</option>
                    <option value="correction">Correction or Updating of Data</option>
                    <option value="erasure">Erasure / Deletion of Non-Statutory Data</option>
                    <option value="withdraw">Withdraw Consent for Future Processing</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#556B4B]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aman Khan"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#556B4B]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#556B4B]">Request Details / Notes</label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Specify details regarding your data request..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none"
                  />
                </div>

                <AntigravityButton variant="primary" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Subject Access Request"}
                </AntigravityButton>
              </form>
            )}
          </AppleLiquidCard>
        )}

        {activeSection === "dpo" && (
          <AppleLiquidCard variant="light" className="p-8 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3]">Data Protection Officer (DPO) Contact</h2>
            <p className="text-[#556B4B]">Email: dpo@falixdental.com • Address: Hazara & Family Dental Clinics, India</p>
            <p className="text-[#556B4B]">If unsatisfied with grievance redressal, Data Principals may register a complaint with the Data Protection Board of India (DPBI).</p>
          </AppleLiquidCard>
        )}
      </main>

      <footer className="border-t border-[#A3B799]/30 py-6 text-center text-xs text-[#556B4B]">
        © 2026 Dental Clinic Network • MEITY DPDP 2023 & DPDP Rules 2025 Compliant
      </footer>
    </div>
  );
}

export default function DpdpPageClient() {
  return (
    <ProgressiveLoader skeleton={<LegalDocSkeleton />}>
      <DpdpPageClientContent />
    </ProgressiveLoader>
  );
}
