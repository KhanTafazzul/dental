'use client'

/**
 * @file app/admin/(dashboard)/prescriptions/PrescriptionsClient.tsx
 * @description Patient Prescriptions Archive & Clinical Hub for Admin Portal.
 * Complies strictly with admistration-side-ui-degine-skill:
 * - Olive brand palette (#4A5D23, #E4E7D3, #F4F6F0, #2C3325, #8A9380)
 * - Outfit & Plus Jakarta Sans typography
 * - Dynamic tabbed interface: Master Cloud Archive, Consultation Prescriptions, and Template Studio
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Printer,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Pill,
  HardDrive,
  RefreshCw,
  Plus
} from 'lucide-react'
import AdminPrescriptionMasterLog from '@/components/prescription/AdminPrescriptionMasterLog'
import PrescriptionSystem from '@/components/prescription/PrescriptionSystem'

interface AppointmentPrescription {
  id: string
  appointment_date: string
  appointment_time?: string
  status: string
  prescription_text?: string | null
  prescription_url?: string | null
  xray_url?: string | null
  problem_description?: string | null
  patients?: {
    id?: string
    name?: string
    email?: string
    mobile?: string
    age?: string | number
  } | null
  doctors?: {
    id?: string
    name?: string
    specialty?: string
  } | null
  branches?: {
    id?: string
    name?: string
  } | null
  invoices?: Array<{
    id: string
    total: number
    invoice_items?: Array<{
      item_name?: string
      quantity?: number
    }>
  }> | null
}

interface PrescriptionsClientProps {
  initialAppointmentPrescriptions: AppointmentPrescription[]
}

export default function PrescriptionsClient({ initialAppointmentPrescriptions }: PrescriptionsClientProps) {
  const [activeTab, setActiveTab] = useState<'archive' | 'consultations' | 'builder'>('archive')
  const [consultationSearch, setConsultationSearch] = useState('')
  const [selectedConsultation, setSelectedConsultation] = useState<AppointmentPrescription | null>(null)

  // Filter consultation prescriptions
  const filteredConsultations = initialAppointmentPrescriptions.filter(appt => {
    if (!consultationSearch.trim()) return true
    const q = consultationSearch.toLowerCase().trim()
    const pName = (appt.patients?.name || '').toLowerCase()
    const pPhone = (appt.patients?.mobile || '').toLowerCase()
    const dName = (appt.doctors?.name || '').toLowerCase()
    const rxText = (appt.prescription_text || '').toLowerCase()
    return pName.includes(q) || pPhone.includes(q) || dName.includes(q) || rxText.includes(q)
  })

  return (
    <div className="w-full min-h-screen pb-16 pt-2 font-['Plus_Jakarta_Sans'] text-[#2C3325] dark:text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 w-full max-w-7xl mx-auto px-2 sm:px-4"
      >
        {/* ═══ 1. HERO HEADER BANNER (Olive Design System) ═══ */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A5D23] to-[#6B823E] p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E4E7D3]">
                <FileText className="w-3.5 h-3.5" />
                <span>Centralized Prescription Management &amp; Cloud Archive</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
                Patient Prescriptions Archive
              </h1>
              <p className="text-sm text-[#E4E7D3] max-w-2xl font-normal leading-relaxed">
                Review all clinic-wide prescription records, compressed PDF archives, automated WhatsApp &amp; Email dispatches, and consultation medical advice.
              </p>
            </div>

            {/* Quick Mode Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('archive')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                  activeTab === 'archive'
                    ? 'bg-white text-[#4A5D23] shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Master Cloud Archive</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('consultations')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                  activeTab === 'consultations'
                    ? 'bg-white text-[#4A5D23] shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Visit Consultations ({initialAppointmentPrescriptions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                  activeTab === 'builder'
                    ? 'bg-white text-[#4A5D23] shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Template Mapper Studio</span>
              </button>
            </div>
          </div>
        </div>

        {/* ═══ 2. TAB CONTENT ═══ */}
        {activeTab === 'archive' && (
          <div className="bg-white dark:bg-[#1A2215] rounded-3xl border border-[#E4E7D3] dark:border-[#4A5D23]/30 p-6 shadow-sm">
            <AdminPrescriptionMasterLog />
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="bg-white dark:bg-[#1A2215] p-4 rounded-2xl border border-[#E4E7D3] dark:border-[#4A5D23]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A9380]" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, doctor, or medicines..."
                  value={consultationSearch}
                  onChange={e => setConsultationSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#E4E7D3] dark:border-[#4A5D23]/40 rounded-xl text-xs bg-[#F4F6F0]/40 dark:bg-black/20 text-[#2C3325] dark:text-slate-100 focus:outline-none focus:border-[#4A5D23]"
                />
              </div>
              <div className="text-xs text-[#8A9380] font-medium">
                Showing <strong>{filteredConsultations.length}</strong> consultation prescription records
              </div>
            </div>

            {/* Consultation Cards Grid */}
            {filteredConsultations.length === 0 ? (
              <div className="py-16 text-center text-[#8A9380] bg-white dark:bg-[#1A2215] rounded-3xl border border-dashed border-[#E4E7D3] dark:border-[#4A5D23]/40 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-[#8A9380]/60" />
                <h4 className="font-bold text-[#2C3325] dark:text-slate-200">No consultation prescriptions found</h4>
                <p className="text-xs">Try adjusting your search query to find previous patient visits.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConsultations.map((appt, idx) => {
                  const inv = appt.invoices && appt.invoices.length > 0 ? appt.invoices[0] : null
                  return (
                    <div
                      key={appt.id || idx}
                      className="bg-white dark:bg-[#1A2215] p-5 rounded-2xl border border-[#E4E7D3] dark:border-[#4A5D23]/30 shadow-xs space-y-3 hover:shadow-md transition"
                    >
                      {/* Patient & Doctor Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-[#E4E7D3]/60 pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#2C3325] dark:text-white font-['Outfit']">
                            {appt.patients?.name || 'Patient'}
                          </h4>
                          <p className="text-xs text-[#8A9380]">
                            {appt.patients?.mobile || 'No Phone'} • Age: {appt.patients?.age || 'N/A'}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E4E7D3] text-[#4A5D23]">
                          {appt.appointment_date} @ {appt.appointment_time?.substring(0, 5) || 'Visit'}
                        </span>
                      </div>

                      {/* Doctor info */}
                      <div className="text-xs text-[#8A9380] flex items-center justify-between">
                        <span>Attending: <strong className="text-[#2C3325] dark:text-slate-200">Dr. {appt.doctors?.name || 'Clinic Specialist'}</strong></span>
                        <span>{appt.branches?.name || 'Clinic Branch'}</span>
                      </div>

                      {/* Clinical Prescription Advice */}
                      {appt.prescription_text && (
                        <div className="p-3 bg-[#F4F6F0] dark:bg-black/20 rounded-xl border border-[#E4E7D3]/80 text-xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A5D23] dark:text-[#E4E7D3] mb-1">
                            Prescription &amp; Clinical Advice
                          </p>
                          <p className="text-[#2C3325] dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {appt.prescription_text}
                          </p>
                        </div>
                      )}

                      {/* Issued Medicines List if invoice attached */}
                      {inv?.invoice_items && inv.invoice_items.length > 0 && (
                        <div className="p-3 bg-[#F4F6F0]/60 dark:bg-black/10 rounded-xl border border-[#E4E7D3]/60 text-xs space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A5D23] dark:text-[#E4E7D3] flex items-center gap-1">
                            <Pill className="w-3 h-3" /> Prescribed Medicines ({inv.invoice_items.length})
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            {inv.invoice_items.map((it, itIdx) => (
                              <div key={itIdx} className="flex justify-between bg-white dark:bg-[#1A2215] px-2 py-1 rounded border border-[#E4E7D3]/40">
                                <span className="truncate pr-1">{it.item_name}</span>
                                <span className="font-mono text-[#4A5D23]">x{it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Bar: Print PDF, View X-Ray */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E4E7D3]/40">
                        {inv ? (
                          <a
                            href={`/admin/billing/print/${inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#4A5D23] hover:bg-[#3B4A1C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print A4 Invoice &amp; Rx</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#8A9380] italic">No bill compiled</span>
                        )}

                        <div className="flex items-center gap-2">
                          {appt.prescription_url && (
                            <a
                              href={appt.prescription_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-xs font-semibold text-[#4A5D23] bg-[#E4E7D3]/40 hover:bg-[#E4E7D3] rounded-lg transition"
                            >
                              Rx PDF
                            </a>
                          )}
                          {appt.xray_url && (
                            <a
                              href={appt.xray_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-xs font-semibold text-[#4A5D23] bg-[#E4E7D3]/40 hover:bg-[#E4E7D3] rounded-lg transition"
                            >
                              X-Ray
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="rounded-3xl overflow-hidden border border-[#E4E7D3] dark:border-[#4A5D23]/30 shadow-sm">
            <PrescriptionSystem embedded />
          </div>
        )}
      </motion.div>
    </div>
  )
}
