'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, MapPin, ArrowRight, Heart, Star, Shield, CheckCircle2, User, LogOut, ShieldCheck, Lock } from 'lucide-react'
import DentalLogo from '@/components/DentalLogo'
import DpdpModal from '@/components/DpdpModal'

import DeleteAccountModal from '@/components/DeleteAccountModal'

import SupportModal from '@/components/SupportModal'

// Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const cardVariantLeft = {
  hidden: { opacity: 0, y: 30, x: -10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 1.15, ease: [0.25, 0.1, 0.25, 1] as const, delay: 0.3 },
  },
}

const cardVariantRight = {
  hidden: { opacity: 0, y: 30, x: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 1.15, ease: [0.25, 0.1, 0.25, 1] as const, delay: 0.45 },
  },
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion()

  const [patientUser, setPatientUser] = useState<{ email: string; fullName: string } | null>(null)
  const [showDpdpModal, setShowDpdpModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  const checkPatientAuth = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('falix_patient_user')
      if (saved) {
        try {
          setPatientUser(JSON.parse(saved))
        } catch (e) {
          setPatientUser(null)
        }
      } else {
        setPatientUser(null)
      }
    }
  }

  useEffect(() => {
    checkPatientAuth()
    const handleTriggerDelete = () => setShowDeleteModal(true)
    const handleTriggerSupport = () => setShowSupportModal(true)
    window.addEventListener('falix_auth_changed', checkPatientAuth)
    window.addEventListener('falix_trigger_delete_modal', handleTriggerDelete)
    window.addEventListener('falix_trigger_support_modal', handleTriggerSupport)
    return () => {
      window.removeEventListener('falix_auth_changed', checkPatientAuth)
      window.removeEventListener('falix_trigger_delete_modal', handleTriggerDelete)
      window.removeEventListener('falix_trigger_support_modal', handleTriggerSupport)
    }
  }, [])

  const handlePatientLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('falix_patient_user')
      window.dispatchEvent(new Event('falix_auth_changed'))
    }
  }

  const blob1Animate = shouldReduceMotion ? {} : { scale: [1, 1.08, 1], rotate: [0, 5, 0] }
  const blob1Transition = shouldReduceMotion ? { duration: 0 } : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' as const }

  const blob2Animate = shouldReduceMotion ? {} : { scale: [1, 1.12, 1], rotate: [0, -6, 0] }
  const blob2Transition = shouldReduceMotion ? { duration: 0 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }

  const blob3Animate = shouldReduceMotion ? {} : { scale: [1, 1.06, 1] }
  const blob3Transition = shouldReduceMotion ? { duration: 0 } : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }

  const sphere1Animate = shouldReduceMotion ? {} : { y: [0, -14, 0], x: [0, 6, 0] }
  const sphere1Transition = shouldReduceMotion ? { duration: 0 } : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' as const }

  const sphere2Animate = shouldReduceMotion ? {} : { y: [0, 14, 0], x: [0, -6, 0] }
  const sphere2Transition = shouldReduceMotion ? { duration: 0 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }

  const sphere3Animate = shouldReduceMotion ? {} : { y: [0, -12, 0] }
  const sphere3Transition = shouldReduceMotion ? { duration: 0 } : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen overflow-hidden selection:bg-cyan-500 selection:text-white">

      {/* ═══ HEADER BAR ═══ */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass sticky top-0 z-50 border-b border-white/60 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <DentalLogo size={36} />
            <div className="flex flex-col">
              <span className="text-lg font-serif font-semibold tracking-tight text-slate-900 group-hover:text-cyan-700 transition-colors">
                Dental Clinic
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500">
                Network
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSupportModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100/80 px-3 py-1.5 rounded-xl border border-cyan-200/60 transition-colors"
            >
              Patient Support & FAQ
            </button>

            <button
              onClick={() => setShowDpdpModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl border border-teal-200/60 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> DPDP Compliance
            </button>

            {patientUser ? (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-2xl shadow-md text-xs">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-semibold max-w-[120px] truncate">{patientUser.fullName}</span>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  title="Delete Account"
                  className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold transition-colors"
                >
                  Delete Account
                </button>
                <button
                  onClick={handlePatientLogout}
                  title="Sign Out"
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-cyan-700 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" /> Patient Sign In
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* ═══ HERO SECTION ═══ */}
      <main className="flex-1 flex flex-col items-center justify-center relative perspective-stage">
        
        {/* Decorative Floating Blobs with Smooth Framer Motion */}
        <motion.div
          animate={blob1Animate}
          transition={blob1Transition}
          className="blob blob-teal w-80 h-80 -top-20 -left-20 pointer-events-none opacity-80"
        />
        <motion.div
          animate={blob2Animate}
          transition={blob2Transition}
          className="blob blob-teal w-96 h-96 -bottom-32 -right-32 pointer-events-none opacity-80"
        />
        <motion.div
          animate={blob3Animate}
          transition={blob3Transition}
          className="blob blob-amber w-72 h-72 top-1/3 right-10 pointer-events-none opacity-70"
        />

        {/* Floating 3D Spheres (Framermotion Smooth Loop) */}
        <motion.div
          animate={sphere1Animate}
          transition={sphere1Transition}
          className="absolute top-16 left-[15%] w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 shadow-lg shadow-cyan-500/30 pointer-events-none"
        />
        <motion.div
          animate={sphere2Animate}
          transition={sphere2Transition}
          className="absolute top-32 right-[20%] w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-300 shadow-lg shadow-amber-500/30 pointer-events-none"
        />
        <motion.div
          animate={sphere3Animate}
          transition={sphere3Transition}
          className="absolute bottom-40 left-[25%] w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-emerald-300 shadow-lg shadow-teal-500/30 pointer-events-none"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-16 px-6 max-w-6xl mx-auto w-full relative z-10"
        >
          
          {/* Hero Text */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            
            {/* Badge */}
            <motion.div variants={itemFadeUp} className="inline-block mb-8">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-md border border-cyan-200/80 rounded-full text-cyan-800 text-xs font-bold tracking-wide shadow-lg shadow-cyan-500/10 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
                Trusted 3D Dental Care Network
              </motion.span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemFadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 font-normal leading-[1.1] tracking-tight"
            >
              Premium Dental Care,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-amber-500 animate-text-gradient font-semibold">
                Tailored to You
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemFadeUp}
              className="mt-8 text-lg md:text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto"
            >
              Welcome to our modern dental clinic network. Experience gentle, precise, and state-of-the-art oral healthcare across our local branches.
            </motion.p>

            {/* Social Proof Strip */}
            <motion.div variants={itemFadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <motion.div whileHover={{ scale: 1.04 }} className="flex items-center gap-2 cursor-pointer">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-300 to-teal-400 border-2 border-white shadow-sm" />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white shadow-sm" />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-300 to-green-400 border-2 border-white shadow-sm" />
                </div>
                <span className="font-semibold text-slate-700">500+ Happy Patients</span>
              </motion.div>
              <div className="w-px h-4 bg-slate-300/80 hidden sm:block" />
              <motion.div whileHover={{ scale: 1.04 }} className="flex items-center gap-1.5 cursor-pointer">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span className="font-semibold text-slate-700">4.9 Star Rating</span>
              </motion.div>
              <div className="w-px h-4 bg-slate-300/80 hidden sm:block" />
              <motion.div whileHover={{ scale: 1.04 }} className="flex items-center gap-1.5 cursor-pointer">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span className="font-semibold text-slate-700">2 Local Branches</span>
              </motion.div>
            </motion.div>

          </div>

          {/* ═══ BRANCH CARDS (CRISP TEXT & SMOOTH ROTATION) ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            
            {/* Branch 1: Hazara Dental Clinic */}
            <motion.div
              variants={cardVariantLeft}
              whileHover={{
                y: -8,
                transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] as const }
              }}
              className="group relative h-full card-3d glass-3d border border-white/80 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transform-gpu subpixel-antialiased"
            >
              {/* Radial Light Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-2xl group-hover:from-cyan-400/35 group-hover:to-teal-400/35 transition-all duration-700 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out shadow-md shadow-cyan-500/25">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors duration-500">
                  Hazara Dental Clinic
                </h2>
                <p className="text-slate-600 text-sm font-light leading-relaxed mb-6">
                  Specialized in clinical dental precision and advanced oral care. Modern, tranquil clinical environment.
                </p>
                
                <ul className="space-y-3 text-xs text-slate-600 font-medium mb-8">
                  <motion.li whileHover={{ x: 6, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }} className="flex items-center gap-2.5 transition-transform duration-500">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 shadow-sm shadow-cyan-500/50" />
                    Orthodontics & Invisible Braces
                  </motion.li>
                  <motion.li whileHover={{ x: 6, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }} className="flex items-center gap-2.5 transition-transform duration-500">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 shadow-sm shadow-teal-500/50" />
                    Dental Implants & Laser Surgery
                  </motion.li>
                  <motion.li whileHover={{ x: 6, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }} className="flex items-center gap-2.5 transition-transform duration-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                    Professional Laser Teeth Whitening
                  </motion.li>
                </ul>
              </div>

              <Link 
                href="/hazara"
                className="relative z-10 inline-flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm transition-all duration-500 shadow-lg shadow-cyan-600/20 hover:shadow-xl hover:shadow-cyan-600/30 btn-shimmer"
              >
                Visit Hazara Branch Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" />
              </Link>
            </motion.div>

            {/* Branch 2: Family Dental Clinic */}
            <motion.div
              variants={cardVariantRight}
              whileHover={{
                y: -8,
                transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] as const }
              }}
              className="group relative h-full card-3d glass-3d border border-white/80 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transform-gpu subpixel-antialiased"
            >
              {/* Radial Light Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:from-amber-400/35 group-hover:to-orange-400/35 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 ease-out shadow-md shadow-amber-500/25">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-amber-800 transition-colors duration-500">
                  Family Dental Clinic
                </h2>
                <p className="text-slate-600 text-sm font-light leading-relaxed mb-6">
                  Tailored for patients of all ages. Comfortable, warm, and stress-free dental care for the whole family.
                </p>
                
                <ul className="space-y-3 text-xs text-slate-600 font-medium mb-8">
                  <motion.li whileHover={{ x: 6, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }} className="flex items-center gap-2.5 transition-transform duration-500">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-sm shadow-amber-500/50" />
                    Gentle Pediatric Dental Care
                  </motion.li>
                  <motion.li whileHover={{ x: 6, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }} className="flex items-center gap-2.5 transition-transform duration-500">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-500/50" />
                    Routine Preventive Cleanings
                  </motion.li>
                  <motion.li whileHover={{ x: 6, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } }} className="flex items-center gap-2.5 transition-transform duration-500">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-sm shadow-rose-500/50" />
                    Aesthetic Restorations & White Fillings
                  </motion.li>
                </ul>
              </div>

              <Link 
                href="/family"
                className="relative z-10 inline-flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white rounded-2xl font-bold text-sm transition-all duration-500 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 btn-shimmer"
              >
                Visit Family Branch Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" />
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="glass border-t border-slate-200/40 py-10 text-center"
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">© 2026 Dental Clinics. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap justify-center">
            <button
              onClick={() => setShowSupportModal(true)}
              className="hover:text-cyan-700 transition-colors text-cyan-600 font-bold"
            >
              Contact Support & FAQ
            </button>
            <button
              onClick={() => setShowDpdpModal(true)}
              className="hover:text-cyan-700 transition-colors inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> DPDP Compliance
            </button>
            <Link href="/dpdp" className="hover:text-cyan-700 transition-colors">
              Data Rights Portal
            </Link>
            <Link href="/privacy" className="hover:text-cyan-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-cyan-700 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </motion.footer>

      {/* DPDP Compliance Modal & Delete Account Modal & Support Modal */}
      <DpdpModal isOpen={showDpdpModal} onClose={() => setShowDpdpModal(false)} />
      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} patientEmail={patientUser?.email} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  )
}

