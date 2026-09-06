'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Globe, CheckCircle2, AlertCircle, FileText, Lock, 
  ArrowLeft, Send, RefreshCw, Sparkles, Building2, UserCheck, Shield
} from 'lucide-react';
import { DPDP_TRANSLATIONS, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/dpdpTranslations';
import { submitDpdpRequest } from '@/app/admin/actions';
import DentalLogo from '@/components/DentalLogo';

export default function DpdpPageClient() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [activeSection, setActiveSection] = useState<'overview' | 'rights' | 'sar' | 'dpo'>('overview');

  // Form State
  const [requestType, setRequestType] = useState<'access' | 'correction' | 'erasure' | 'withdraw'>('access');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = DPDP_TRANSLATIONS[lang] || DPDP_TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const handleSarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
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
        setErrorMsg('Failed to process request. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <DentalLogo size={34} />
            <div className="flex flex-col">
              <span className="text-base font-serif font-semibold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                Dental Clinic Care
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-teal-400">
                DPDP Act Compliance
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white py-1.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Clinic
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full" dir={currentLangObj.dir}>
        
        {/* Title & Language Bar */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Personal Data Protection Act 2023 & DPDP Rules 2025</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-3">
            {t.consentNoticeTitle}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Protecting patient clinical privacy, data subject rights, and medical records under Indian law.
          </p>

          {/* Language Selector */}
          <div className="mt-6 inline-flex items-center gap-3 p-2 bg-slate-900 border border-teal-500/30 rounded-2xl shadow-xl">
            <Globe className="w-4 h-4 text-teal-400 ml-2" />
            <span className="text-xs font-semibold text-slate-300">Supported Languages:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {[
            { id: 'overview', label: 'Policy Overview' },
            { id: 'rights', label: 'Data Principal Rights' },
            { id: 'sar', label: 'Submit SAR Request' },
            { id: 'dpo', label: 'DPO & Grievance Redressal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-sm leading-relaxed font-medium">
                {t.consentNoticeText}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-400" />
                    {t.privacyPolicyTitle}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.privacyText}</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    {t.cookiePolicyTitle}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.cookieText}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-400" />
                  {t.termsTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{t.termsText}</p>
              </div>
            </div>
          )}

          {activeSection === 'rights' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">{t.rightsTitle}</h2>
              <p className="text-xs text-slate-400 mb-6">
                Under Section 5, 6 & 11 of the Digital Personal Data Protection Act 2023, as a Data Principal (patient), you possess the following enforceable rights:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Right to Access
                  </div>
                  <p className="text-xs text-slate-300">{t.rightAccess}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Right to Correction
                  </div>
                  <p className="text-xs text-slate-300">{t.rightCorrection}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Right to Erasure
                  </div>
                  <p className="text-xs text-slate-300">{t.rightErasure}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Right to Withdraw Consent
                  </div>
                  <p className="text-xs text-slate-300">{t.rightWithdraw}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sar' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-1">{t.sarTitle}</h2>
                <p className="text-xs text-slate-400">
                  Submit a formal Data Rights or Erasure request under DPDP Rules 2025.
                </p>
              </div>

              {ticketId ? (
                <div className="p-8 rounded-3xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-center space-y-4 shadow-xl">
                  <CheckCircle2 className="w-14 h-14 text-teal-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Subject Access Request Successfully Received</h3>
                  <p className="text-xs">
                    Your unique Tracking Ticket ID:
                  </p>
                  <div className="inline-block px-4 py-2 bg-slate-950 text-teal-300 font-mono text-base font-bold rounded-xl border border-teal-500/40">
                    {ticketId}
                  </div>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Our designated Data Protection Officer (DPO) will audit your request against statutory healthcare record retention rules and issue an official response within 72 business hours.
                  </p>
                  <button
                    onClick={() => setTicketId(null)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
                  >
                    Submit Additional Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSarSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Request Type</label>
                      <select
                        value={requestType}
                        onChange={(e: any) => setRequestType(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="access">Access Personal Data Summary</option>
                        <option value="correction">Correct / Update Personal Details</option>
                        <option value="erasure">Erasure / Right to be Forgotten</option>
                        <option value="withdraw">Withdraw Consent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Data Principal Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Request Details</label>
                    <textarea
                      rows={3}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Specify exact records, updates, or reason for request..."
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Submitting Subject Access Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t.submitRequest}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeSection === 'dpo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Data Protection Officer & Grievance Redressal</h2>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-teal-500/30 space-y-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">{t.dataController}</span>
                <h3 className="text-lg font-bold text-white">{t.dpoTitle}</h3>
                <p className="text-xs text-slate-300 font-mono">{t.dpoEmail}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
                  <div className="text-2xl font-bold text-teal-400">72 Hours</div>
                  <div className="text-[11px] text-slate-400 font-medium">Grievance SLA Response</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
                  <div className="text-2xl font-bold text-cyan-400">AES-256</div>
                  <div className="text-[11px] text-slate-400 font-medium">Clinical Records Encryption</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
                  <div className="text-2xl font-bold text-emerald-400">Section 8</div>
                  <div className="text-[11px] text-slate-400 font-medium">Zero Data Monetization</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>Digital Personal Data Protection Act 2023 & DPDP Rules 2025 Certified</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Clinic Homepage</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
