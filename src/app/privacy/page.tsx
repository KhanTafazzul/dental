import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Globe } from 'lucide-react';
import DentalLogo from '@/components/DentalLogo';

export const metadata: Metadata = {
  title: 'Privacy Policy | DPDP Act 2023 Compliance',
  description: 'Data protection practices and privacy notice compliant with Digital Personal Data Protection Act 2023.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <DentalLogo size={34} />
            <span className="text-base font-serif font-semibold text-white">Dental Data Protection</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" /> DPDP Act 2023 & DPDP Rules 2025
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Privacy & Data Security Policy</h1>
          <p className="text-xs text-slate-400">Comprehensive Patient Privacy Protections</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6 text-xs text-slate-300 leading-relaxed shadow-2xl">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" /> 1. Legal Basis & Consent
            </h2>
            <p>
              Under Section 5 & 6 of DPDP Act 2023, data is gathered solely for healthcare services. We implement AES-256 encryption at rest and TLS 1.3 in transit. Storage period is restricted to clinical record mandates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" /> 2. Multi-Language Privacy Rights
            </h2>
            <p>
              You can read our privacy notices and submit Subject Access Requests (SAR) in 9 Indian languages (English, Hindi, Urdu, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada) on our <Link href="/dpdp" className="text-teal-400 underline">DPDP Compliance Portal</Link>.
            </p>
          </section>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Need to submit a Data Erasure or Access Request?</span>
              <span className="text-[11px] text-slate-300">Submit an official SAR request directly to our Data Protection Officer.</span>
            </div>
            <Link
              href="/dpdp"
              className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shrink-0 hover:bg-teal-400 transition-colors"
            >
              Access DPDP Portal
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © 2026 Dental Data Protection • Grievance Response SLA: 72 Hours
      </footer>
    </div>
  );
}
