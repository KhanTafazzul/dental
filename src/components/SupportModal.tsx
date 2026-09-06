'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, X, Search, Phone, MessageSquare, Mail, HelpCircle, 
  ChevronDown, ChevronUp, Clock, CheckCircle2, Send, Loader2, Sparkles, MapPin, ShieldCheck
} from 'lucide-react';
import { submitSupportTicket } from '@/app/admin/actions';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'faq' | 'contact' | 'ticket';
}

export default function SupportModal({ isOpen, onClose, defaultTab = 'faq' }: SupportModalProps) {
  const [tab, setTab] = useState<'faq' | 'contact' | 'ticket'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Ticket Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('Hazara Branch');
  const [category, setCategory] = useState('Appointment Booking');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const faqs = [
    {
      q: "Is there any upfront money or credit card required to book an appointment?",
      a: "No upfront money or credit card details are ever required! All appointment bookings across Hazara Dental Store and Family Dental Store clinics are 100% free. Consultation and treatment costs are billed in-clinic after your consultation."
    },
    {
      q: "How does the clinic doctor receive my appointment details?",
      a: "Immediately upon submitting your booking form, our automated dispatch system securely emails all patient details (Name, Age, Mobile Number, Email, and Problem Description) directly to the assigned clinic doctor's inbox."
    },
    {
      q: "Will I receive automated SMS or reminder calls?",
      a: "No. In accordance with clinic policy, automated patient SMS/email notifications are disabled to prevent spam. Communication is strictly one-way directly from clinic staff to you when needed."
    },
    {
      q: "How do I access my prescription or digital X-ray report?",
      a: "After your clinic examination, your practitioner can upload your diagnosis, prescription photo, or X-ray report directly to your patient profile and dispatch it to your registered email address."
    },
    {
      q: "How do I request account deletion or data erasure under DPDP Act 2023?",
      a: "You can exercise your Right to Erasure anytime by visiting our DPDP Compliance Center or clicking 'Delete Account' in your patient profile header. Your login credentials will be permanently erased immediately."
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, Subject, and Details).');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitSupportTicket({
        name,
        email,
        phone,
        branch,
        category,
        subject,
        message,
      });

      if (res.success) {
        setTicketId(res.ticketId);
      } else {
        setErrorMsg('Failed to submit support ticket. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting support ticket.');
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
          className="relative w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Patient Support & Help Center
                </h2>
                <p className="text-xs text-teal-400 font-medium">Instant FAQ • Clinic Assistance • DPO Ticket Portal</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <button
              onClick={() => setTab('faq')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'faq'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              1. FAQ Search (Self-Service)
            </button>
            <button
              onClick={() => setTab('contact')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'contact'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              2. Contact Channels & SLA
            </button>
            <button
              onClick={() => setTab('ticket')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'ticket'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              3. Submit Ticket
            </button>
          </div>

          {/* Tab 1: FAQ Search (First option for instant self-service) */}
          {tab === 'faq' && (
            <div className="space-y-4 animate-fade-in min-h-[300px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions e.g. booking, payment, report, prescription..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs font-semibold text-white gap-2"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-teal-400 shrink-0" />
                          {faq.q}
                        </span>
                        {expandedFaq === idx ? (
                          <ChevronUp className="w-4 h-4 text-teal-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {expandedFaq === idx && (
                        <p className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-slate-300 leading-relaxed font-light">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No matching FAQ found. You can switch to &quot;Submit Ticket&quot; or call our clinic hotline directly!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Contact Channels & SLA Matrix */}
          {tab === 'contact' && (
            <div className="space-y-4 animate-fade-in min-h-[300px]">
              <div className="text-xs text-slate-300 mb-2">
                Choose the best communication channel suited to your needs. All SLA response expectations are clearly outlined below:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Channel 1: Phone Hotline */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Phone className="w-5 h-5 text-cyan-400" />
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Instant</span>
                    </div>
                    <h3 className="font-bold text-white text-xs">Emergency Phone Hotline</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Best for severe toothache, urgent appointment changes, or immediate clinic directions.</p>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 block font-mono">+91 (Clinic Branch Line)</span>
                    <span className="text-[10px] text-teal-400 font-semibold">Response SLA: Immediate</span>
                  </div>
                </div>

                {/* Channel 2: WhatsApp Chat */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">5 - 15 Mins</span>
                    </div>
                    <h3 className="font-bold text-white text-xs">WhatsApp / Live Chat</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Best for fast questions regarding timings, doctor schedules, or doctor locations.</p>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 block">Direct Clinic WhatsApp</span>
                    <span className="text-[10px] text-teal-400 font-semibold">Response SLA: &lt; 15 Mins</span>
                  </div>
                </div>

                {/* Channel 3: Email Ticket & DPO */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Mail className="w-5 h-5 text-teal-400" />
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">72h Max</span>
                    </div>
                    <h3 className="font-bold text-white text-xs">Email Ticket & DPO</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Best for formal medical report requests, DPDP privacy rights, or billing inquiries.</p>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 block font-mono">support@dentalclinic.in</span>
                    <span className="text-[10px] text-teal-400 font-semibold">Response SLA: 72 Business Hours</span>
                  </div>
                </div>

              </div>

              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-400" /> What to prepare when contacting support:
                </span>
                <p className="text-[11px] text-slate-300">
                  Please have your <strong className="text-white">Patient Name</strong>, <strong className="text-white">Mobile Number</strong>, and preferred branch (<strong className="text-teal-300">Hazara</strong> or <strong className="text-amber-300">Family</strong>) ready for immediate resolution.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Submit Support Ticket Form */}
          {tab === 'ticket' && (
            <div className="animate-fade-in min-h-[300px]">
              {ticketId ? (
                <div className="p-6 rounded-2xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Support Ticket Dispatched</h3>
                  <p className="text-xs">
                    Ticket Reference ID: <strong className="text-teal-300 font-mono text-sm bg-slate-950 px-2 py-1 rounded-md">{ticketId}</strong>
                  </p>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Our patient care team has received your ticket. We will respond directly to <span className="text-white font-semibold">{email}</span> within our committed SLA window.
                  </p>
                  <button
                    onClick={() => setTicketId(null)}
                    className="mt-2 text-xs text-teal-400 hover:underline font-semibold"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priya Sharma"
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mobile Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Clinic Branch</label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="Hazara Branch">Hazara Dental Clinic</option>
                        <option value="Family Branch">Family Dental Clinic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="Appointment Booking">Appointment Booking</option>
                        <option value="Prescription & X-Ray">Prescription & X-Ray Report</option>
                        <option value="Doctor Inquiry">Doctor Consultation Inquiry</option>
                        <option value="DPDP Privacy">DPDP Privacy & Rights</option>
                        <option value="General Support">General Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your question..."
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Message Details</label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Elaborate on your issue or request so our support team can assist you immediately..."
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        Submitting Support Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Support Ticket
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Badge */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Verified Patient Care Support
            </span>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Close Support Center
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
