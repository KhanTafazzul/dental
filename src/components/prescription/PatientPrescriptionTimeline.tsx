'use client'

/**
 * @file components/prescription/PatientPrescriptionTimeline.tsx
 * @description Chronological Patient Prescription Timeline with quick diagnosis previews
 * and secure S3 Presigned URL PDF viewing modal.
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Calendar,
  User,
  Pill,
  Download,
  ExternalLink,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export interface PrescriptionRecord {
  id: string
  patient_id: string
  doctor_id?: string
  appointment_id?: string
  visit_number: number
  b2_object_key: string
  file_size_kb: number
  diagnosis_summary?: {
    notes?: string
    medicines?: string[]
    [key: string]: any
  }
  delivery_status?: {
    whatsapp?: string
    email?: string
    last_attempt?: string
  }
  patient_name?: string
  patient_phone?: string
  doctor_name?: string
  created_at: string
  presignedUrl?: string
}

interface PatientPrescriptionTimelineProps {
  patientId: string
  patientName?: string
}

export default function PatientPrescriptionTimeline({
  patientId,
  patientName,
}: PatientPrescriptionTimelineProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/patients/${patientId}/prescriptions`)
      const data = await res.json()
      if (data.success && Array.isArray(data.prescriptions)) {
        setPrescriptions(data.prescriptions)
      } else {
        setError(data.error || 'No prescription records found.')
      }
    } catch (err: any) {
      console.error('[PatientPrescriptionTimeline error]:', err)
      setError(err.message || 'Failed to load prescription history.')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7D3] dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-[#2C3325] dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4A5D23] dark:text-lime-400" />
            Prescription & Clinical History
          </h3>
          <p className="text-xs text-[#8A9380] dark:text-slate-400">
            Chronological records of all dental consultations, prescribed medications, and digital prescriptions.
          </p>
        </div>

        <button
          onClick={fetchPrescriptions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A5D23] dark:text-lime-400 bg-[#E4E7D3]/40 dark:bg-slate-800 hover:bg-[#E4E7D3] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#4A5D23] dark:text-lime-400 animate-spin" />
          <p className="text-xs text-[#8A9380] dark:text-slate-400 font-medium">
            Fetching secure cloud records from Backblaze B2...
          </p>
        </div>
      )}

      {/* Error or Empty State */}
      {!loading && (error || prescriptions.length === 0) && (
        <div className="p-8 rounded-2xl bg-[#F8FAF6] dark:bg-slate-900 border border-[#E4E7D3] dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#E4E7D3]/60 dark:bg-slate-800 flex items-center justify-center mx-auto text-[#4A5D23] dark:text-lime-400">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#2C3325] dark:text-slate-200">
            No Prescriptions on Record
          </h4>
          <p className="text-xs text-[#8A9380] dark:text-slate-400 max-w-sm mx-auto">
            {error || 'Once your doctor completes a consultation and issues a prescription, your digital records and medication guides will appear here.'}
          </p>
        </div>
      )}

      {/* Timeline List */}
      {!loading && prescriptions.length > 0 && (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E4E7D3] dark:before:bg-slate-800">
          {prescriptions.map((rx, idx) => {
            const dateStr = rx.created_at
              ? new Date(rx.created_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent Consultation'

            const medicines = Array.isArray(rx.diagnosis_summary?.medicines)
              ? rx.diagnosis_summary.medicines
              : []

            const notes = rx.diagnosis_summary?.notes || ''

            return (
              <div key={rx.id || idx} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#4A5D23] dark:bg-lime-500 border-4 border-white dark:border-slate-950 flex items-center justify-center text-white shadow-sm" />

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E4E7D3] dark:border-slate-800 hover:border-[#4A5D23]/40 dark:hover:border-lime-500/40 shadow-sm transition-all space-y-4">
                  {/* Top Bar: Visit Number & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#4A5D23]/10 dark:bg-lime-500/10 text-[#4A5D23] dark:text-lime-400 border border-[#4A5D23]/20">
                        Visit #{rx.visit_number || idx + 1}
                      </span>
                      {rx.visit_number > 1 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Repeat Visit
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#8A9380] dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2C3325] dark:text-slate-200">
                    <User className="w-4 h-4 text-[#4A5D23] dark:text-lime-400" />
                    <span>Prescribed by {rx.doctor_name || 'Dr. Falix Dental Team'}</span>
                    <span className="text-[11px] font-normal text-[#8A9380] dark:text-slate-400">
                      ({rx.file_size_kb || 0} KB • Optimized)
                    </span>
                  </div>

                  {/* Diagnosis Notes */}
                  {notes && (
                    <div className="p-3 rounded-xl bg-[#F8FAF6] dark:bg-slate-800/50 border border-[#E4E7D3]/60 dark:border-slate-800 text-xs text-[#4A543E] dark:text-slate-300">
                      <strong className="text-[#2C3325] dark:text-slate-100 font-bold block mb-1">
                        Doctor's Clinical Notes:
                      </strong>
                      <p className="whitespace-pre-wrap leading-relaxed">{notes}</p>
                    </div>
                  )}

                  {/* Quick-Preview Medicine Tags */}
                  {medicines.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9380] dark:text-slate-400 flex items-center gap-1">
                        <Pill className="w-3 h-3 text-[#4A5D23] dark:text-lime-400" /> Prescribed Medications
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {medicines.map((med, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E4E7D3]/50 dark:bg-slate-800 text-[#2C3325] dark:text-slate-200 border border-[#E4E7D3] dark:border-slate-700"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F4F6F0] dark:border-slate-800/80">
                    <div className="flex items-center gap-2 text-[11px] text-[#8A9380] dark:text-slate-400">
                      {rx.delivery_status?.whatsapp === 'sent' ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered to WhatsApp
                        </span>
                      ) : rx.delivery_status?.whatsapp === 'failed' ? (
                        <span className="flex items-center gap-1 text-rose-500 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> WhatsApp Pending
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {rx.presignedUrl && (
                        <>
                          <button
                            onClick={() => {
                              setPreviewUrl(rx.presignedUrl || null)
                              setPreviewTitle(`Visit #${rx.visit_number} — ${dateStr}`)
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#4A5D23] dark:text-lime-400 bg-[#E4E7D3]/40 dark:bg-slate-800 hover:bg-[#E4E7D3] dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Quick View
                          </button>

                          <a
                            href={rx.presignedUrl}
                            download={`Prescription_Visit_${rx.visit_number}.pdf`}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#4A5D23] hover:bg-[#3d4d1c] dark:bg-lime-600 dark:hover:bg-lime-500 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PDF Quick Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#E4E7D3] dark:border-slate-800">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E4E7D3] dark:border-slate-800 flex items-center justify-between bg-[#F8FAF6] dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4A5D23] dark:text-lime-400" />
                <h4 className="text-sm font-bold text-[#2C3325] dark:text-slate-100">
                  {previewTitle || 'Digital Prescription Viewer'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A5D23] dark:text-lime-400 bg-[#E4E7D3]/50 dark:bg-slate-700 hover:bg-[#E4E7D3] flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> New Tab
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
              <iframe
                src={`${previewUrl}#toolbar=0`}
                className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                title="Prescription PDF Document"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
