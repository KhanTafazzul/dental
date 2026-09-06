import React from 'react';
import Link from 'next/link';
import { Stethoscope, ArrowLeft, Home, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import DentalLogo from '@/components/DentalLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950 font-sans relative overflow-hidden">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <DentalLogo size={34} />
            <span className="text-base font-serif font-semibold text-white group-hover:text-teal-300 transition-colors">
              Dental Clinic Network
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 py-1.5 px-3 rounded-lg bg-teal-500/10 border border-teal-500/20"
          >
            Go Home
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-xl w-full text-center space-y-8 bg-slate-900/80 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-2xl shadow-2xl">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Stethoscope className="w-4 h-4 text-rose-400" />
            <span>404 • Page Not Found</span>
          </div>

          {/* Large Stylized 404 Number */}
          <div className="relative">
            <h1 className="text-8xl sm:text-9xl font-extrabold font-serif tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 opacity-90">
              404
            </h1>
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">
              The requested clinical page or route does not exist
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            The web address you entered may have changed or the appointment link is no longer valid. You can safely return home or navigate directly to our branch portals.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/"
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" /> Home Portal
            </Link>

            <Link
              href="/hazara"
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-cyan-400" /> Hazara Clinic
            </Link>

            <Link
              href="/family"
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" /> Family Clinic
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <Link href="/dpdp" className="text-teal-400 hover:underline">DPDP Privacy Rights</Link>
            </span>
            <span className="text-slate-600">•</span>
            <Link href="/support" className="text-cyan-400 hover:underline font-semibold">Contact Patient Support & FAQ</Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © 2026 Dental Clinic Care Network. All rights reserved.
      </footer>

    </div>
  );
}
