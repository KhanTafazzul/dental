import React from 'react'
import Link from 'next/link'
import { Stethoscope, Home, MapPin, ShieldCheck, HelpCircle } from 'lucide-react'
import DentalLogo from '@/components/DentalLogo'

export default function NotFound() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-[#4A5D23] selection:text-white font-sans relative overflow-hidden">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#4A5D23]/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Go to homepage">
            <DentalLogo size={32} />
            <span className="text-sm sm:text-base font-serif font-semibold text-white group-hover:text-teal-300 transition-colors">
              Hazara & Family Dental Clinics
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 py-1.5 px-3 rounded-lg bg-teal-500/10 border border-teal-500/20"
          >
            Home Website
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="max-w-xl w-full text-center space-y-6 sm:space-y-8 bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-12 backdrop-blur-2xl shadow-2xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Stethoscope className="w-4 h-4 text-rose-400" />
            <span>404 - Page Not Found</span>
          </div>

          {/* Large Stylized 404 Number */}
          <div className="relative">
            <h1 className="text-7xl sm:text-9xl font-extrabold font-serif tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-[#E4E7D3] opacity-90">
              404
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">
              The requested clinical page or route does not exist
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Please use the navigation links below to return to the active services.
          </p>

          {/* Action Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/"
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#4A5D23] to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4A5D23]/20 hover:opacity-95 transition"
            >
              <Home className="w-4 h-4" /> Home Page
            </Link>

            <Link
              href="/hazara"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-cyan-400" /> Hazara Branch
            </Link>

            <Link
              href="/family"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" /> Family Branch
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/dpdp" className="inline-flex items-center gap-1.5 text-teal-400 hover:underline">
              <ShieldCheck className="w-3.5 h-3.5" />
              DPDP Privacy Rights
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/support" className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              Patient Support & Inquiries
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        &copy; {currentYear} Hazara & Family Dental Clinics. All rights reserved.
      </footer>
    </div>
  )
}
