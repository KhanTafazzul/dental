'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Globe, FileText, Lock, AlertCircle, CheckCircle2, User, Mail, Phone, RefreshCw, Send, ChevronRight } from 'lucide-react';
import { DPDP_TRANSLATIONS, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/dpdpTranslations';
import { submitDpdpRequest } from '@/app/admin/actions';

interface DpdpModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLang?: SupportedLanguage;
}

export default function DpdpModal({ isOpen, onClose, defaultLang = 'en' }: DpdpModalProps) {
  const [lang, setLang] = useState<SupportedLanguage>(defaultLang);
  const [tab, setTab] = useState<'notice' | 'rights' | 'sar' | 'dpo'>('notice');

  // SAR Form state
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
        setErrorMsg('Failed to submit request. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          dir={currentLangObj.dir}
          className="relative w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {t.consentNoticeTitle}
                </h2>
                <p className="text-xs text-teal-400 font-medium">Compliance Portal • DPDP Act 2023 & Rules 2025</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector Bar */}
          <div className="mb-6 p-2 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold text-teal-300">
              <Globe className="w-4 h-4" />
              <span>Select Language (9 Indian Languages):</span>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-xl border border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => setTab('notice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === 'notice'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Consent Notice
            </button>
            <button
              onClick={() => setTab('rights')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === 'rights'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Data Principal Rights
            </button>
            <button
              onClick={() => setTab('sar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === 'sar'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Submit SAR Request
            </button>
            <button
              onClick={() => setTab('dpo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === 'dpo'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              DPO Contact & SLA
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[260px] text-xs leading-relaxed text-slate-300">
            {tab === 'notice' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-slate-200 font-medium">
                  {t.consentNoticeText}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-2">{t.privacyPolicyTitle}</h3>
                  <p>{t.privacyText}</p>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-2">{t.cookiePolicyTitle}</h3>
                  <p>{t.cookieText}</p>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-2">{t.termsTitle}</h3>
                  <p>{t.termsText}</p>
                </div>
              </div>
            )}

            {tab === 'rights' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-bold text-white text-sm">{t.rightsTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Right to Access</span>
                      <span>{t.rightAccess}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Right to Correction</span>
                      <span>{t.rightCorrection}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Right to Erasure</span>
                      <span>{t.rightErasure}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Right to Withdraw</span>
                      <span>{t.rightWithdraw}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block text-xs">Want to close your account?</span>
                    <span className="text-[11px] text-slate-300">Exercising your Right to Erasure under Section 11 of DPDP Act 2023.</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new Event('falix_trigger_delete_modal'));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {tab === 'sar' && (
              <div className="animate-fade-in space-y-4">
                {ticketId ? (
                  <div className="p-5 rounded-2xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto" />
                    <h3 className="text-base font-bold text-white">Subject Access Request Logged</h3>
                    <p className="text-xs">
                      Reference Ticket ID: <strong className="text-teal-300 font-mono text-sm bg-slate-950 px-2 py-1 rounded-md">{ticketId}</strong>
                    </p>
                    <p className="text-xs text-slate-300">
                      Our Data Protection Officer has received your request. In accordance with DPDP Rules 2025, a response will be issued to your email address within 72 business hours.
                    </p>
                    <button
                      onClick={() => setTicketId(null)}
                      className="mt-2 text-xs text-teal-400 hover:underline font-semibold"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSarSubmit} className="space-y-3">
                    <h3 className="font-bold text-white text-sm mb-1">{t.sarTitle}</h3>
                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Request Type</label>
                        <select
                          value={requestType}
                          onChange={(e: any) => setRequestType(e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                        >
                          <option value="access">Access Personal Data Summary</option>
                          <option value="correction">Correct / Update Data</option>
                          <option value="erasure">Erasure / Right to be Forgotten</option>
                          <option value="withdraw">Withdraw Processing Consent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Data Principal Name"
                          className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Request Details / Reason</label>
                      <textarea
                        rows={2}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Provide details about the specific records or correction requested..."
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Submission...
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

            {tab === 'dpo' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{t.dataController}</span>
                  <p className="text-sm font-semibold text-white">{t.dpoTitle}</p>
                  <p className="text-xs text-slate-300">{t.dpoEmail}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-xs">Technical Safeguards & Compliance</h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                    <li>AES-256 Bit Encryption at rest for clinical records</li>
                    <li>TLS 1.3 Strict HTTPS Security in transit</li>
                    <li>Zero third-party data monetization guarantee under Section 8 of DPDP Act 2023</li>
                    <li>Automatic record retention policy aligned with Indian Medical Council guidelines</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer Badge */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              DPDP Act 2023 Compliant
            </span>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Close Portal
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
