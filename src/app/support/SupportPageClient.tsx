'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LifeBuoy, Search, Phone, MessageSquare, Mail, HelpCircle, 
  ChevronDown, ChevronUp, Clock, CheckCircle2, Send, Loader2, Sparkles, MapPin, ShieldCheck, Home, ArrowLeft
} from 'lucide-react';
import DentalLogo from '@/components/DentalLogo';
import { submitSupportTicket } from '@/app/admin/actions';

export default function SupportPageClient() {
  const [tab, setTab] = useState<'faq' | 'contact' | 'ticket'>('faq');
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
    },
    {
      q: "What should I do in case of a severe toothache emergency outside clinic hours?",
      a: "For immediate emergency guidance, call our 24/7 Phone Hotline or send an urgent message via WhatsApp. Our clinic doctor on call will provide immediate triage instructions."
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <DentalLogo size={34} />
            <span className="text-base font-serif font-semibold text-white group-hover:text-teal-300 transition-colors">
              Dental Support Center
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-teal-400" />
              Return Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Support Portal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="bg-slate-900/90 border border-teal-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <LifeBuoy className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Patient Support & Help Center
                </h1>
                <p className="text-xs text-teal-400 font-medium">Instant FAQ • Communication Channels • 72h DPO SLA</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Support Desk Online</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
            <button
              onClick={() => setTab('faq')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                tab === 'faq'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              1. FAQ Search (Self-Service First)
            </button>
            <button
              onClick={() => setTab('contact')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                tab === 'contact'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              2. Contact Channels & SLA Matrix
            </button>
            <button
              onClick={() => setTab('ticket')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                tab === 'ticket'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              3. Submit Support Ticket
            </button>
          </div>

          {/* Tab 1: FAQ Search (Self-Service First) */}
          {tab === 'faq' && (
            <div className="space-y-5">
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
                <p>
                  <strong className="text-white">Instant Answers:</strong> Search our knowledge base below to find immediate resolution without waiting for a support agent response.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions e.g. payment, booking, prescription, delete account..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-white/10 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs font-semibold text-white gap-3"
                      >
                        <span className="flex items-center gap-2.5">
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
                        <p className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 leading-relaxed font-light">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No matching FAQ found. Switch to &quot;Submit Support Ticket&quot; or call our hotline!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Contact Channels & SLA Matrix */}
          {tab === 'contact' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-300">
                Choose the best communication channel suited to your needs. Below are clear guidelines on response times, benefits, and required preparation details:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Phone */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Phone className="w-6 h-6 text-cyan-400" />
                      <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Instant</span>
                    </div>
                    <h3 className="font-bold text-white text-sm">Emergency Phone Hotline</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Best for severe toothache, instant appointment changes, or immediate clinic navigation instructions.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs text-slate-400 block font-mono">Hazara / Family Clinic Hotline</span>
                    <span className="text-xs text-teal-400 font-semibold">SLA: Immediate Call Pick</span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <MessageSquare className="w-6 h-6 text-emerald-400" />
                      <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">&lt; 15 Mins</span>
                    </div>
                    <h3 className="font-bold text-white text-sm">WhatsApp / Direct Chat</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Best for fast, non-urgent questions about doctor consultation availability or clinic location maps.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs text-slate-400 block">Direct Clinic WhatsApp Desk</span>
                    <span className="text-xs text-teal-400 font-semibold">SLA: 5 - 15 Minutes</span>
                  </div>
                </div>

                {/* Email Ticket */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Mail className="w-6 h-6 text-teal-400" />
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">72h Max</span>
                    </div>
                    <h3 className="font-bold text-white text-sm">Email Ticket & DPO Portal</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Best for formal medical prescription copies, DPDP data access/erasure requests, or billing inquiries.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs text-slate-400 block font-mono">support@dentalclinic.in</span>
                    <span className="text-xs text-teal-400 font-semibold">SLA: 72 Business Hours</span>
                  </div>
                </div>

              </div>

              {/* What to prepare section */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-white flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-teal-400" /> What to prepare before contacting support:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To ensure our patient care desk can assist you without delay, please have your <strong className="text-white">Registered Full Name</strong>, <strong className="text-white">10-Digit Mobile Number</strong>, and preferred clinic branch (<strong className="text-teal-300">Hazara Branch</strong> or <strong className="text-amber-300">Family Branch</strong>) ready.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Submit Support Ticket Form */}
          {tab === 'ticket' && (
            <div>
              {ticketId ? (
                <div className="p-8 rounded-2xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-teal-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Support Ticket Successfully Dispatched</h3>
                  <p className="text-xs">
                    Your Ticket Reference ID: <strong className="text-teal-300 font-mono text-base bg-slate-950 px-3 py-1.5 rounded-lg border border-teal-500/30">{ticketId}</strong>
                  </p>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
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
                <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priya Sharma"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Clinic Branch</label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="Hazara Branch">Hazara Dental Clinic</option>
                        <option value="Family Branch">Family Dental Clinic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your inquiry..."
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message Details</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question or issue in detail so our support team can assist you immediately..."
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-teal-500/20"
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

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Dental Care Network • Hazara & Family Dental Stores</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link href="/privacy" className="hover:text-teal-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-teal-400">Terms of Service</Link>
            <Link href="/dpdp" className="hover:text-teal-400">DPDP Compliance</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
