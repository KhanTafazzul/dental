"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
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
  const shouldReduceMotion = useReducedMotion();
  const [patientUser, setPatientUser] = useState<{ email: string; fullName: string } | null>(null);
  const [showDpdpModal, setShowDpdpModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const checkPatientAuth = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("falix_patient_user");
      if (saved) {
        try {
          setPatientUser(JSON.parse(saved));
        } catch (e) {
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
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-[#F5F7F3] dark:bg-[#0F150D] text-[#1C2618] dark:text-[#E2E8DC] blueprint-grid transition-colors duration-300">
      {/* ═══ HEADER BAR (APPLE LIQUID GLASS) ═══ */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-[#F5F7F3]/70 dark:bg-[#0F150D]/70 backdrop-blur-2xl border-b border-white/50 dark:border-white/10 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <DentalLogo size={36} />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#1C2618] dark:text-[#F5F7F3] group-hover:text-[#556B4B] transition-colors">
                Dental Clinic
              </span>
              <TelemetryBadge label="Network Active" code="SYS-01" variant="sage" className="scale-90 -ml-1" />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <AntigravityButton
              variant="ghost"
              size="sm"
              onClick={() => setShowSupportModal(true)}
              className="hidden sm:inline-flex text-xs"
            >
              Patient Support & FAQ
            </AntigravityButton>

            {patientUser ? (
              <div className="flex items-center gap-2 bg-[#2C3A27] text-[#F5F7F3] px-3 py-1.5 rounded-xl border border-white/20 shadow-md text-xs">
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
                  className="p-1 hover:bg-white/10 rounded-lg text-[#A3B799] hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <AntigravityButton variant="primary" size="sm">
                  <User className="w-3.5 h-3.5" /> Patient Sign In
                </AntigravityButton>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* ═══ HERO SECTION ═══ */}
      <main className="flex-1 flex flex-col items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
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
                <TelemetryBadge label="3D Spatial Dental Architecture" code="LIVE" variant="paper" />
              </motion.div>

              <motion.h1
                variants={itemFadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F7F3] tracking-tight leading-tight"
              >
                Precision Dental Care,{" "}
                <span className="text-[#A3B799] underline decoration-[#6E8662] decoration-4 underline-offset-8">
                  Engineered for You
                </span>
              </motion.h1>

              <motion.p
                variants={itemFadeUp}
                className="text-base sm:text-lg text-[#E2E8DC]/90 max-w-2xl mx-auto font-light leading-relaxed"
              >
                Welcome to our modern dental clinic network. Experience gentle, precise, and state-of-the-art oral healthcare across our local branches.
              </motion.p>

              {/* Social Proof Strip */}
              <motion.div variants={itemFadeUp} className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[#E2E8DC]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Star className="w-3.5 h-3.5 text-[#A3B799] fill-[#A3B799]" /> 4.9 Star Rating
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" /> 500+ Happy Patients
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-[#A3B799]" /> 2 Local Branches
                </span>
              </motion.div>
            </div>
          </AppleLiquidCard>

          {/* ═══ BRANCH CARDS ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Branch 1: Hazara Dental Clinic */}
            <AppleLiquidCard variant="light" className="p-8 flex flex-col justify-between space-y-6">
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
                  Specialized in clinical dental precision and advanced oral care. Modern, tranquil clinical environment.
                </p>

                <ul className="space-y-2 text-xs font-medium text-[#2C3A27] dark:text-[#E2E8DC]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Orthodontics & Invisible Braces
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Dental Implants & Laser Surgery
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Professional Laser Teeth Whitening
                  </li>
                </ul>
              </div>

              <Link href="/hazara" className="w-full pt-4">
                <AntigravityButton variant="primary" size="lg" className="w-full">
                  Visit Hazara Branch Portal <ArrowRight className="w-4 h-4" />
                </AntigravityButton>
              </Link>
            </AppleLiquidCard>

            {/* Branch 2: Family Dental Clinic */}
            <AppleLiquidCard variant="light" className="p-8 flex flex-col justify-between space-y-6">
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
                  Tailored for patients of all ages. Comfortable, warm, and stress-free dental care for the whole family.
                </p>

                <ul className="space-y-2 text-xs font-medium text-[#2C3A27] dark:text-[#E2E8DC]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Gentle Pediatric Dental Care
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Routine Preventive Cleanings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#556B4B]" /> Aesthetic Restorations & White Fillings
                  </li>
                </ul>
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
      <footer className="bg-[#F5F7F3]/90 dark:bg-[#0F150D]/90 border-t border-[#E2E8DC] dark:border-white/10 py-8 text-center text-xs text-[#556B4B] dark:text-[#A3B799]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Dental Clinics Network. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center font-medium">
            <button onClick={() => setShowSupportModal(true)} className="hover:text-[#2C3A27] dark:hover:text-white transition-colors">
              Support & FAQ
            </button>
            <button onClick={() => setShowDpdpModal(true)} className="hover:text-[#2C3A27] dark:hover:text-white transition-colors inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> DPDP Compliance
            </button>
            <Link href="/privacy" className="hover:text-[#2C3A27] dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#2C3A27] dark:hover:text-white transition-colors">
              Terms
            </Link>
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
