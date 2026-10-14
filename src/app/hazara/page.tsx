import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Phone, Mail, ArrowLeft, ArrowRight, ShieldCheck, Star, Sparkles, Zap } from 'lucide-react'
import { getAdminSupabase } from '@/lib/supabase'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import DentalLogo from '@/components/DentalLogo'

export const metadata: Metadata = {
  title: 'Hazara Dental Clinic | Restorative & Orthodontic Specialists',
  description: 'Book consultations and specialized dental treatments at Hazara Dental Clinic. Orthodontics, implants, digital diagnostics, and comprehensive clinical care.',
}

export default async function HazaraHome() {
  const supabaseServer = getAdminSupabase()
  const { data: branch } = await supabaseServer
    .from('branches')
    .select('working_hours')
    .eq('slug', 'hazara')
    .single()

  const workingHours = branch?.working_hours || 'Monday – Saturday: 9:00 AM – 6:00 PM (Closed on Sunday)'
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen w-full max-w-full font-sans overflow-x-hidden">
      {/* ═══ HEADER ═══ */}
      <header className="glass sticky top-0 z-50 animate-fade-in-down bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 text-xs font-medium">
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-600" />
            Home Gateway
          </Link>
          <Link href="/" className="flex items-center gap-2.5" aria-label="Go to homepage">
            <DentalLogo size={30} />
            <span className="text-base sm:text-lg font-serif text-slate-900 dark:text-white font-normal">
              Hazara{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500 font-semibold">
                Dental Clinic
              </span>
            </span>
          </Link>
          <Link
            href="/hazara/book"
            className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-xl transition-all duration-300 shadow-md shadow-cyan-500/15 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Book Appointment
          </Link>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <main className="flex-1">
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 text-center overflow-hidden">
          <div className="absolute inset-0 gradient-hazara -z-10" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/70 backdrop-blur-md border border-cyan-200/60 rounded-full text-cyan-700 text-xs font-semibold tracking-wide shadow-md shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Clinical Precision & Orthodontics
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-slate-900 dark:text-white font-normal mt-6 leading-tight tracking-tight">
              Excellence in Restorative Care &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 font-semibold">
                Dental Surgery
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              Hazara Dental Clinic offers advanced restorative and orthodontic dentistry in a clean clinical space. Our specialists combine scientific precision with patient-focused care.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link
                href="/hazara/book"
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xl shadow-cyan-600/20 hover:shadow-2xl"
              >
                Schedule Consultation
              </Link>
              <a
                href="#services"
                className="px-8 py-3.5 bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300"
              >
                Explore Specialties
              </a>
            </div>
          </div>
        </section>

        {/* ═══ INFO GRID ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <div className="flex gap-4 items-start p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Consultation Hours</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-light leading-relaxed">{workingHours}</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={150}>
              <div className="flex gap-4 items-start p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Clinic Location</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-light">Hazara Dental Clinic, Main Clinical Avenue</p>
                  <p className="text-slate-400 text-xs mt-0.5 font-light">Medical District, Sector B</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="flex gap-4 items-start p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Direct Contact</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 font-light">
                    Phone:{' '}
                    <a href="tel:+919820012345" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                      +91 98200 12345
                    </a>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 font-light">
                    Email:{' '}
                    <a href="mailto:hazara@flynx.site" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                      hazara@flynx.site
                    </a>
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ═══ SERVICES ═══ */}
        <section id="services" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600">Our Clinical Scope</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-900 dark:text-white mt-2">Hazara Specialized Treatments</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-light mt-3 leading-relaxed">
                Treatment procedures rendered by licensed dental specialists using current diagnostic equipment.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">Orthodontic Procedures</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed mb-4">
                  Alignment corrections using ceramic brackets, modern archwires, or transparent aligner systems.
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-200/60">Specialty</span>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={150}>
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">Dental Implants</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed mb-4">
                  Surgical replacement of tooth roots with titanium fixtures and custom porcelain prosthetic crowns.
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-200/60">Specialty</span>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">Endodontic Care</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed mb-4">
                  Root canal decontamination procedures to treat infection and preserve healthy natural tooth structure.
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-200/60">General Care</span>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="glass border-t border-slate-200/60 dark:border-white/10 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {currentYear} Hazara Dental Clinic. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center font-medium">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Network Home</Link>
            <Link href="/family" className="hover:text-slate-900 dark:hover:text-white transition">Family Branch</Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-slate-900 dark:hover:text-white transition">Cookie Policy</Link>
            <Link href="/support" className="hover:text-slate-900 dark:hover:text-white transition">Patient Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
