"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Heart,
  Star,
  User,
  LogOut,
  ShieldCheck,
  Settings,
  Shield,
  CheckCircle2,
  Phone,
  Mail,
  Menu,
  X,
  Clock,
  HelpCircle,
  Stethoscope,
} from "lucide-react";

import DentalLogo from "@/components/DentalLogo";
import DpdpModal from "@/components/DpdpModal";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import SupportModal from "@/components/SupportModal";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function HomeContent() {
  const [patientUser, setPatientUser] = useState<{ email: string; fullName: string } | null>(null);
  const [showDpdpModal, setShowDpdpModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const checkPatientAuth = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("falix_patient_user");
      if (saved) {
        try {
          setPatientUser(JSON.parse(saved));
        } catch {
          setPatientUser(null);
        }
      } else {
        setPatientUser(null);
      }
    }
  };

  useEffect(() => {
    checkPatientAuth();
    const handleTriggerDelete = () => setShowDeleteModal(true);
    const handleTriggerSupport = () => setShowSupportModal(true);
    window.addEventListener("falix_auth_changed", checkPatientAuth);
    window.addEventListener("falix_trigger_delete_modal", handleTriggerDelete);
    window.addEventListener("falix_trigger_support_modal", handleTriggerSupport);
    return () => {
      window.removeEventListener("falix_auth_changed", checkPatientAuth);
      window.removeEventListener("falix_trigger_delete_modal", handleTriggerDelete);
      window.removeEventListener("falix_trigger_support_modal", handleTriggerSupport);
    };
  }, []);

  const handlePatientLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("falix_patient_user");
      window.dispatchEvent(new Event("falix_auth_changed"));
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen w-full max-w-full overflow-x-hidden bg-[#F5F7F3] dark:bg-[#0F150D] text-[#1C2618] dark:text-[#E2E8DC] blueprint-grid transition-colors duration-300">
      {/* ═══ TOP CLINICAL CONTACT BAR ═══ */}
      <div className="w-full bg-[#2C3A27] text-[#E2E8DC] text-[11px] py-1.5 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#A3B799]" />
              Mon – Sat: 9:00 AM – 7:00 PM
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="text-[#A3B799]">Hazara & Family Clinical Facilities</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:+919820012345"
              className="inline-flex items-center gap-1.5 text-[#F5F7F3] hover:text-[#A3B799] transition font-semibold"
              title="Call Clinical Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-[#A3B799]" />
              +91 98200 12345
            </a>
            <span className="text-white/30">•</span>
            <a
              href="mailto:care@flynx.site"
              className="inline-flex items-center gap-1.5 text-[#F5F7F3] hover:text-[#A3B799] transition"
              title="Email Patient Care"
            >
              <Mail className="w-3.5 h-3.5 text-[#A3B799]" />
              care@flynx.site
            </a>
          </div>
        </div>
      </div>

      {/* ═══ HEADER BAR (APPLE LIQUID GLASS) ═══ */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-[#F5F7F3]/80 dark:bg-[#0F150D]/80 backdrop-blur-2xl border-b border-white/50 dark:border-white/10 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Go to homepage">
            <DentalLogo size={36} />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C2618] dark:text-[#F5F7F3] group-hover:text-[#556B4B] transition-colors">
                Hazara & Family Dental
              </span>
              <TelemetryBadge label="Clinical Network Active" code="SYS-01" variant="sage" className="scale-90 -ml-1" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">
            <Link href="/hazara" className="hover:text-[#556B4B] dark:hover:text-white transition">
              Hazara Branch
            </Link>
            <Link href="/family" className="hover:text-[#556B4B] dark:hover:text-white transition">
              Family Branch
            </Link>
            <button
              onClick={() => setShowSupportModal(true)}
              className="hover:text-[#556B4B] dark:hover:text-white transition cursor-pointer"
            >
              Patient Support & FAQ
            </button>
            <Link href="/administration" className="hover:text-[#556B4B] dark:hover:text-white transition">
              Doctor & Admin Gateway
            </Link>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {patientUser ? (
              <div className="hidden sm:flex items-center gap-2 bg-[#2C3A27] text-[#F5F7F3] px-3 py-1.5 rounded-xl border border-white/20 shadow-md text-xs">
                <User className="w-3.5 h-3.5 text-[#A3B799]" />
                <span className="font-semibold max-w-[120px] truncate">{patientUser.fullName}</span>
                <Link
                  href="/account"
                  title="My Patient Account"
                  className="px-2 py-0.5 rounded-lg bg-[#556B4B]/40 hover:bg-[#556B4B]/60 text-[#E2E8DC] text-[11px] font-semibold transition-colors flex items-center gap-1 border border-white/10"
                >
                  <Settings className="w-3 h-3" /> Account
                </Link>
                <button
                  onClick={handlePatientLogout}
                  title="Sign Out"
                  className="p-1 hover:bg-white/10 rounded-lg text-[#A3B799] hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-block">
                <AntigravityButton variant="primary" size="sm">
                  <User className="w-3.5 h-3.5" /> Patient Portal Sign In
                </AntigravityButton>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ═══ MOBILE DROPDOWN MENU ═══ */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-b border-slate-200 dark:border-white/10 bg-[#F5F7F3] dark:bg-[#142012] px-6 py-4 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-sm font-semibold">
                <Link
                  href="/hazara"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>Hazara Dental Clinic</span>
                  <ArrowRight className="w-4 h-4 text-[#556B4B]" />
                </Link>
                <Link
                  href="/family"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>Family Dental Clinic</span>
                  <ArrowRight className="w-4 h-4 text-[#556B4B]" />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowSupportModal(true);
                  }}
                  className="p-2.5 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Patient Support & Inquiries</span>
                  <HelpCircle className="w-4 h-4 text-[#556B4B]" />
                </button>
                <Link
                  href="/administration"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between text-[#556B4B] dark:text-[#A3B799]"
                >
                  <span>Staff & Doctor Gateway</span>
                  <Stethoscope className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
                {patientUser ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#2C3A27] text-white rounded-xl text-xs">
                    <span className="font-bold truncate">{patientUser.fullName}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-2 py-1 bg-white/20 rounded text-[11px]"
                      >
                        Account
                      </Link>
                      <button onClick={handlePatientLogout} className="p-1 hover:text-rose-300">
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#4A5D23] hover:bg-[#3E5037] text-white font-bold text-center text-xs shadow"
                  >
                    Patient Sign In / Register
                  </Link>
                )}

                <div className="flex items-center justify-between pt-2 text-xs text-[#556B4B] dark:text-[#A3B799]">
                  <a href="tel:+919820012345" className="flex items-center gap-1.5 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> Call Helpline
                  </a>
                  <a href="mailto:care@flynx.site" className="flex items-center gap-1.5 hover:underline">
                    <Mail className="w-3.5 h-3.5" /> Email Care
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══ HERO SECTION ═══ */}
      <main className="flex-1 flex flex-col items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 max-w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto w-full space-y-12 relative z-10"
        >
          {/* Hero Banner Box */}
          <AppleLiquidCard variant="olive" className="p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-3xl mx-auto space-y-6">
              <motion.div variants={itemFadeUp} className="inline-block">
                <TelemetryBadge label="Clinical Healthcare Facilities" code="CERTIFIED" variant="paper" />
              </motion.div>

              <motion.h1
                variants={itemFadeUp}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F7F3] tracking-tight leading-tight"
              >
                Comprehensive Dental Care,{" "}
                <span className="text-[#A3B799] underline decoration-[#6E8662] decoration-4 underline-offset-8">
                  Engineered for Patient Well-Being
                </span>
              </motion.h1>

              <motion.p
                variants={itemFadeUp}
                className="text-sm sm:text-base md:text-lg text-[#E2E8DC]/90 max-w-2xl mx-auto font-light leading-relaxed"
              >
                Welcome to Hazara & Family Dental Clinics. Experience gentle, precise, and state-of-the-art oral healthcare delivered by experienced dental surgeons across our specialized local branches.
              </motion.p>

              {/* Social Proof Strip */}
              <motion.div variants={itemFadeUp} className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-[#E2E8DC]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Star className="w-3.5 h-3.5 text-[#A3B799] fill-[#A3B799]" /> 4.9 Star Clinical Rating
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" /> Over 5,000 Consultations Completed
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-[#A3B799]" /> 2 Dedicated Branch Facilities
                </span>
              </motion.div>
            </div>
          </AppleLiquidCard>

          {/* ═══ BRANCH CARDS ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Branch 1: Hazara Dental Clinic */}
            <AppleLiquidCard variant="light" className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#2C3A27] text-[#F5F7F3] flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <TelemetryBadge label="Hazara Branch" code="HZ-01" variant="olive" />
                </div>

                <h2 className="text-2xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">
                  Hazara Dental Clinic
                </h2>

                <p className="text-sm text-[#556B4B] dark:text-[#A3B799] leading-relaxed">
                  Specialized in clinical dental precision, restorative dental science, and advanced oral surgical procedures. Modern, quiet clinical environment.
                </p>

                <ul className="space-y-2 text-xs font-medium text-[#2C3A27] dark:text-[#E2E8DC]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Orthodontics & Clear Aligners
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Dental Implants & Surgical Restorations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Digital X-Ray Diagnostics & Teeth Whitening
                  </li>
                </ul>

                <div className="pt-2 flex flex-col gap-1 text-xs text-[#556B4B] dark:text-[#A3B799] border-t border-slate-200/50 dark:border-white/10">
                  <a href="tel:+919820012345" className="hover:underline flex items-center gap-1.5 font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">
                    <Phone className="w-3.5 h-3.5 text-[#556B4B]" /> +91 98200 12345
                  </a>
                  <a href="mailto:hazara@flynx.site" className="hover:underline flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#556B4B]" /> hazara@flynx.site
                  </a>
                </div>
              </div>

              <Link href="/hazara" className="w-full pt-4">
                <AntigravityButton variant="primary" size="lg" className="w-full">
                  Visit Hazara Branch Portal <ArrowRight className="w-4 h-4" />
                </AntigravityButton>
              </Link>
            </AppleLiquidCard>

            {/* Branch 2: Family Dental Clinic */}
            <AppleLiquidCard variant="light" className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#3E5037] text-[#F5F7F3] flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <TelemetryBadge label="Family Branch" code="FM-02" variant="sage" />
                </div>

                <h2 className="text-2xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">
                  Family Dental Clinic
                </h2>

                <p className="text-sm text-[#556B4B] dark:text-[#A3B799] leading-relaxed">
                  Tailored for patients of all generations. Gentle, comfortable, and stress-free preventative and pediatric dental care for the entire family.
                </p>

                <ul className="space-y-2 text-xs font-medium text-[#2C3A27] dark:text-[#E2E8DC]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Gentle Pediatric Dentistry & Fluoride Care
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Routine Preventative Scaling & Oral Health
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Aesthetic Dental Restorations & Composite Fillings
                  </li>
                </ul>

                <div className="pt-2 flex flex-col gap-1 text-xs text-[#556B4B] dark:text-[#A3B799] border-t border-slate-200/50 dark:border-white/10">
                  <a href="tel:+919820054321" className="hover:underline flex items-center gap-1.5 font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">
                    <Phone className="w-3.5 h-3.5 text-[#556B4B]" /> +91 98200 54321
                  </a>
                  <a href="mailto:family@flynx.site" className="hover:underline flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#556B4B]" /> family@flynx.site
                  </a>
                </div>
              </div>

              <Link href="/family" className="w-full pt-4">
                <AntigravityButton variant="secondary" size="lg" className="w-full">
                  Visit Family Branch Portal <ArrowRight className="w-4 h-4" />
                </AntigravityButton>
              </Link>
            </AppleLiquidCard>
          </div>
        </motion.div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#F5F7F3]/90 dark:bg-[#0F150D]/90 border-t border-[#E2E8DC] dark:border-white/10 py-10 text-xs text-[#556B4B] dark:text-[#A3B799]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Go to homepage">
              <DentalLogo size={32} />
              <span className="font-serif font-bold text-base text-[#1C2618] dark:text-[#F5F7F3]">
                Hazara & Family Dental Clinics
              </span>
            </Link>

            <div className="flex items-center gap-6 flex-wrap justify-center font-medium">
              <Link href="/hazara" className="hover:text-[#2C3A27] dark:hover:text-white transition">
                Hazara Branch
              </Link>
              <Link href="/family" className="hover:text-[#2C3A27] dark:hover:text-white transition">
                Family Branch
              </Link>
              <Link href="/administration" className="hover:text-[#2C3A27] dark:hover:text-white transition">
                Administration Gateway
              </Link>
              <button onClick={() => setShowSupportModal(true)} className="hover:text-[#2C3A27] dark:hover:text-white transition cursor-pointer">
                Support & Inquiries
              </button>
              <button onClick={() => setShowDpdpModal(true)} className="hover:text-[#2C3A27] dark:hover:text-white transition inline-flex items-center gap-1 cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5" /> DPDP Compliance
              </button>
              <Link href="/privacy" className="hover:text-[#2C3A27] dark:hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#2C3A27] dark:hover:text-white transition">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-[#2C3A27] dark:hover:text-white transition">
                Cookie Policy
              </Link>
            </div>
          </div>

          <div className="border-t border-[#E2E8DC]/60 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#556B4B]/80 dark:text-[#A3B799]/80 text-center sm:text-left">
            <p>&copy; {currentYear} Hazara & Family Dental Clinics. All rights reserved.</p>
            <p>Certified Dental Facilities • Compliant with Digital Personal Data Protection Act 2023</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DpdpModal isOpen={showDpdpModal} onClose={() => setShowDpdpModal(false)} />
      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} patientEmail={patientUser?.email} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <ProgressiveLoader skeleton={<HomeSkeleton />}>
      <HomeContent />
    </ProgressiveLoader>
  );
}
