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
  Sparkles,
  Calendar,
  Smile,
  Award,
  ChevronRight,
  Check,
  Zap,
} from "lucide-react";

import DentalLogo from "@/components/DentalLogo";
import DpdpModal from "@/components/DpdpModal";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import SupportModal from "@/components/SupportModal";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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
    <div className="flex-1 flex flex-col justify-between min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFBF7] dark:bg-[#0F150D] text-[#2C3325] dark:text-[#F5F7F3] font-ui transition-colors duration-300">
      
      {/* ═══ TOP CLINICAL CONTACT BAR ═══ */}
      <div className="w-full bg-[#2C3325] text-[#E4E7D3] text-[11px] py-2 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-3 flex-wrap justify-center font-medium">
            <span className="inline-flex items-center gap-1.5 text-[#88B04B]">
              <Clock className="w-3.5 h-3.5" />
              Mon – Sat: 9:00 AM – 7:00 PM
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="text-white/80">Hazara & Family Clinical Facilities</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="tel:+919820012345" className="inline-flex items-center gap-1.5 hover:text-[#88B04B] transition">
              <Phone className="w-3.5 h-3.5 text-[#88B04B]" />
              +91 98200 12345
            </a>
            <span className="text-white/30">•</span>
            <a href="mailto:care@flynx.site" className="inline-flex items-center gap-1.5 hover:text-[#88B04B] transition">
              <Mail className="w-3.5 h-3.5 text-[#88B04B]" />
              care@flynx.site
            </a>
          </div>
        </div>
      </div>

      {/* ═══ MAIN HEADER ═══ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-[#FDFBF7]/85 dark:bg-[#0F150D]/85 backdrop-blur-xl border-b border-[#4A5D23]/15 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Go to homepage">
            <div className="p-2 rounded-2xl bg-[#4A5D23]/10 dark:bg-white/10 group-hover:bg-[#4A5D23]/20 transition">
              <DentalLogo size={32} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base sm:text-lg font-bold font-display tracking-tight text-[#2C3325] dark:text-white">
                Hazara & Family Dental
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#556B4B] dark:text-[#A3B799]">
                Advanced Dental Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC]">
            <Link href="/hazara" className="hover:text-[#4A5D23] dark:hover:text-[#88B04B] transition">
              Hazara Branch
            </Link>
            <Link href="/family" className="hover:text-[#4A5D23] dark:hover:text-[#88B04B] transition">
              Family Health Hub
            </Link>
            <Link href="/support" className="hover:text-[#4A5D23] dark:hover:text-[#88B04B] transition">
              Help Desk & FAQs
            </Link>
            <Link href="/administration" className="text-[#556B4B] hover:text-[#2C3325] dark:hover:text-white transition">
              Doctor Gateway
            </Link>
          </div>

          {/* User Auth or Sign-in */}
          <div className="flex items-center gap-3">
            {patientUser ? (
              <div className="hidden sm:flex items-center gap-2 bg-[#4A5D23] text-white px-3 py-1.5 rounded-2xl shadow-md text-xs font-medium">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                  {patientUser.fullName.charAt(0)}
                </div>
                <span className="font-semibold max-w-[120px] truncate">{patientUser.fullName}</span>
                <Link
                  href="/account"
                  className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" /> Dashboard
                </Link>
                <button
                  onClick={handlePatientLogout}
                  title="Sign Out"
                  className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-block">
                <button className="px-5 py-2.5 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs shadow-md shadow-[#4A5D23]/25 transition flex items-center gap-1.5 cursor-pointer">
                  <User className="w-3.5 h-3.5" /> Patient Sign In
                </button>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-[#F0F2EB] dark:bg-[#1C2618] border border-[#4A5D23]/20 text-[#2C3325] dark:text-white lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ═══ MOBILE MENU ═══ */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-b border-[#4A5D23]/15 bg-[#FDFBF7] dark:bg-[#142012] px-6 py-4 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-sm font-semibold">
                <Link
                  href="/hazara"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-[#F0F2EB] dark:hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>Hazara Dental Clinic</span>
                  <ArrowRight className="w-4 h-4 text-[#4A5D23]" />
                </Link>
                <Link
                  href="/family"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-[#F0F2EB] dark:hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>Family Health Hub</span>
                  <ArrowRight className="w-4 h-4 text-[#4A5D23]" />
                </Link>
                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-[#F0F2EB] dark:hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>Help Desk & FAQs</span>
                  <HelpCircle className="w-4 h-4 text-[#4A5D23]" />
                </Link>
                <Link
                  href="/administration"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-[#F0F2EB] dark:hover:bg-white/5 transition flex items-center justify-between text-[#556B4B]"
                >
                  <span>Doctor & Administration</span>
                  <Stethoscope className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-3 border-t border-[#4A5D23]/15 flex flex-col gap-2">
                {patientUser ? (
                  <div className="flex items-center justify-between p-3 bg-[#4A5D23] text-white rounded-2xl text-xs">
                    <span className="font-bold truncate">{patientUser.fullName}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-2.5 py-1 bg-white/20 rounded-xl text-[11px] font-bold"
                      >
                        Dashboard
                      </Link>
                      <button onClick={handlePatientLogout} className="p-1 hover:text-rose-200">
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-2xl bg-[#4A5D23] text-white font-display font-bold text-center text-xs shadow-md"
                  >
                    Patient Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══ HERO SECTION (SPLIT ASYMMETRICAL WITH 3D TOOTH BADGE) ═══ */}
      <main className="flex-1 flex flex-col items-center justify-center relative py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-full space-y-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto w-full space-y-14 relative z-10"
        >
          {/* Hero Split Card */}
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#2C3325] via-[#374528] to-[#1C2618] text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#88B04B]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A5D23]/30 rounded-full blur-3xl pointer-events-none" />

            {/* Left Narrative */}
            <div className="relative z-10 max-w-2xl space-y-6 text-center lg:text-left">
              <motion.div variants={itemFadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E4E7D3]">
                <Sparkles className="w-3.5 h-3.5 text-[#88B04B]" />
                Next-Generation Painless Dentistry
              </motion.div>

              <motion.h1
                variants={itemFadeUp}
                className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white leading-tight"
              >
                World-Class Dental Care, Designed for Every Smile.
              </motion.h1>

              <motion.p
                variants={itemFadeUp}
                className="text-sm sm:text-base text-[#E4E7D3]/85 leading-relaxed font-light"
              >
                Experience compassionate oral healthcare with digital 3D imaging, painless single-visit root canals, restorative surgical implants, and clear aligners across Hazara and Family branches.
              </motion.p>

              {/* Action Buttons */}
              <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  href="/hazara/book"
                  className="px-7 py-4 rounded-2xl bg-[#88B04B] hover:bg-[#789e3f] text-[#1C2618] font-display font-bold text-sm transition shadow-lg shadow-[#88B04B]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Book at Hazara Clinic
                </Link>
                <Link
                  href="/family/book"
                  className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-sm transition border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smile className="w-4 h-4" /> Book for Family Member
                </Link>
              </motion.div>

              {/* Social Metrics */}
              <motion.div variants={itemFadeUp} className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-[#E4E7D3]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <Star className="w-3.5 h-3.5 text-[#88B04B] fill-[#88B04B]" /> 4.9 Clinical Rating
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#88B04B]" /> 100% Sterile Class-B Autoclave
                </span>
              </motion.div>
            </div>

            {/* Right 3D Floating Tooth Element */}
            <div className="relative z-10 shrink-0 w-64 sm:w-72 flex flex-col items-center justify-center">
              <div className="hero-3d-element p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#88B04B] to-[#E4E7D3] flex items-center justify-center shadow-lg">
                  <DentalLogo size={56} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#88B04B] font-bold block">
                    Zero Pain Protocol
                  </span>
                  <h4 className="text-sm font-bold font-display text-white mt-0.5">Gentle Anesthesia</h4>
                  <p className="text-[10px] text-[#E4E7D3]/70 mt-1">Single-visit computerized tooth restorative therapy.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ DUAL BRANCH COMPARISON CARDS ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Branch 1: Hazara Dental Clinic */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#4A5D23] text-white flex items-center justify-center shadow-md">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#E4E7D3] dark:bg-[#2C3A27] text-[#4A5D23] dark:text-[#88B04B] font-mono text-xs font-bold">
                    BRANCH HZ-01
                  </span>
                </div>

                <h2 className="text-2xl font-bold font-display text-[#2C3325] dark:text-white">
                  Hazara Dental Clinic
                </h2>

                <p className="text-xs sm:text-sm text-[#556B4B] dark:text-[#A3B799] leading-relaxed">
                  Advanced restorative and orthodontic center specializing in digital panoramic imaging, titanium implants, cosmetic smile design, and wisdom tooth surgery.
                </p>

                <ul className="space-y-2 text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" /> Orthodontics & Clear Aligners
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" /> Surgical Dental Implants & Bone Grafting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" /> Digital Radiography & Cosmetic Veneers
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#4A5D23]/10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/hazara/book"
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Consultation
                </Link>
                <Link
                  href="/hazara"
                  className="py-3.5 px-5 rounded-2xl border border-[#4A5D23]/20 hover:bg-[#F0F2EB] dark:hover:bg-[#141F16] text-[#2C3325] dark:text-white font-display font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Branch Info</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Branch 2: Family Dental Care */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#4A5D23] text-white flex items-center justify-center shadow-md">
                    <Smile className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#E4E7D3] dark:bg-[#2C3A27] text-[#4A5D23] dark:text-[#88B04B] font-mono text-xs font-bold">
                    BRANCH FM-02
                  </span>
                </div>

                <h2 className="text-2xl font-bold font-display text-[#2C3325] dark:text-white">
                  Family Dental Care
                </h2>

                <p className="text-xs sm:text-sm text-[#556B4B] dark:text-[#A3B799] leading-relaxed">
                  Compassionate oral healthcare designed for children, parents, and seniors. Routine cleanings, preventive fluoride, pediatric dentistry, and denture solutions.
                </p>

                <ul className="space-y-2 text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" /> Pediatric Dental Care & Cavity Prevention
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" /> Ultrasonic Scaling, Polishing & Stain Removal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D23]" /> Flexible Partial Dentures & Crown Fittings
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#4A5D23]/10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/family/book"
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Consultation
                </Link>
                <Link
                  href="/family"
                  className="py-3.5 px-5 rounded-2xl border border-[#4A5D23]/20 hover:bg-[#F0F2EB] dark:hover:bg-[#141F16] text-[#2C3325] dark:text-white font-display font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Family Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#4A5D23]/15 py-10 px-4 sm:px-6 lg:px-8 text-xs text-[#556B4B] dark:text-[#A3B799] bg-[#FDFBF7] dark:bg-[#0F150D]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <DentalLogo size={24} />
            <p>© {currentYear} Hazara & Family Dental Clinics • DPDP Act 2023 & DPDP Rules 2025 Compliant</p>
          </div>
          <div className="flex items-center gap-5 font-semibold">
            <Link href="/terms" className="hover:text-[#2C3325] dark:hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-[#2C3325] dark:hover:text-white">Privacy</Link>
            <Link href="/dpdp" className="hover:text-[#2C3325] dark:hover:text-white">DPDP Rights</Link>
            <Link href="/cookies" className="hover:text-[#2C3325] dark:hover:text-white">Cookie Policy</Link>
            <Link href="/support" className="hover:text-[#2C3325] dark:hover:text-white">Support</Link>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DpdpModal isOpen={showDpdpModal} onClose={() => setShowDpdpModal(false)} />
      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  );
}

export default function HomePage() {
  return (
    <ProgressiveLoader skeleton={<HomeSkeleton />}>
      <HomeContent />
    </ProgressiveLoader>
  );
}
