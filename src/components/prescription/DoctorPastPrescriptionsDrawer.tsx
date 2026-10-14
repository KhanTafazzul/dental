'use client'

/**
 * @file components/prescription/DoctorPastPrescriptionsDrawer.tsx
 * @description Doctor Consultation "Previous Visit History" Side-Panel for repeat patients.
 * 
 * Automatically detects previous visits (visit_number > 1), surfaces past prescriptions,
 * allows quick-preview of prior medications, and enables side-by-side comparison during consultation.
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  History,
  X,
  FileText,
  Calendar,
  Pill,
  ExternalLink,
  Eye,
  Sparkles,
  ChevronRight,
  Loader2,
  Clock,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react'
import type { PrescriptionRecord } from './PatientPrescriptionTimeline'

interface DoctorPastPrescriptionsDrawerProps {
  patientId: string
  patientName: string
  currentAppointmentId?: string
  isOpen: boolean
  onClose: () => void
  onImportMedicines?: (medicines: string[]) => void
}

export default function DoctorPastPrescriptionsDrawer({
  patientId,
  patientName,
  currentAppointmentId,
  isOpen,
  onClose,
  onImportMedicines,
}: DoctorPastPrescriptionsDrawerProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRx, setSelectedRx] = useState<PrescriptionRecord | null>(null)
  const [copiedMedIndex, setCopiedMedIndex] = useState<number | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/patients/${patientId}/prescriptions`)
      const data = await res.json()
      if (data.success && Array.isArray(data.prescriptions)) {
        setPrescriptions(data.prescriptions)
        if (data.prescriptions.length > 0) {
          setSelectedRx(data.prescriptions[0])
        }
      }
    } catch (err) {
      console.error('[DoctorPastPrescriptionsDrawer error]:', err)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    if (isOpen && patientId) {
      fetchHistory()
    }
  }, [isOpen, patientId, fetchHistory])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-[#E4E7D3] dark:border-slate-800 transition-transform duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E4E7D3] dark:border-slate-800 flex items-center justify-between bg-[#F8FAF6] dark:bg-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#4A5D23] dark:text-lime-400" />
              <h3 className="text-base font-bold text-[#2C3325] dark:text-slate-100">
                Previous Consultation Records
              </h3>
              {prescriptions.length > 1 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  Repeat Patient • {prescriptions.length} Visits
                </span>
              )}
            </div>
            <p className="text-xs text-[#8A9380] dark:text-slate-400 mt-0.5">
              Reviewing past prescriptions and treatment plans for <strong className="text-[#2C3325] dark:text-slate-200">{patientName}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Column: Visit Selector */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E4E7D3] dark:border-slate-800 overflow-y-auto p-4 space-y-2 bg-[#FAFBF8] dark:bg-slate-950/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9380] dark:text-slate-400 px-2 block">
              Consultation Timeline
            </span>

            {loading && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-5 h-5 text-[#4A5D23] dark:text-lime-400 animate-spin" />
                <span className="text-[11px] text-slate-500">Loading history...</span>
              </div>
            )}

            {!loading && prescriptions.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No previous prescriptions on record. This is their first recorded digital visit.
              </div>
            )}

            {!loading &&
              prescriptions.map((rx) => {
                const isSelected = selectedRx?.id === rx.id
                const dateStr = rx.created_at
                  ? new Date(rx.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Past Visit'

                return (
                  <button
                    key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#4A5D23] text-white border-[#4A5D23] shadow-sm font-semibold'
                        : 'bg-white dark:bg-slate-900 border-[#E4E7D3] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#4A5D23]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Visit #{rx.visit_number}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {dateStr}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-1 truncate ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                      {rx.doctor_name || 'Dr. Falix'}
                    </div>
                  </button>
                )
              })}
          </div>

          {/* Right Column: Selected Prescription Details & Side-by-Side Preview */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {selectedRx ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#4A5D23] dark:text-lime-400" />
                      Prescription — Visit #{selectedRx.visit_number}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prescribed on {new Date(selectedRx.created_at).toLocaleDateString()} by{' '}
                      {selectedRx.doctor_name || 'Attending Doctor'}
                    </p>
                  </div>

                  {selectedRx.presignedUrl && (
                    <a
                      href={selectedRx.presignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A5D23] dark:text-lime-400 bg-[#E4E7D3]/40 dark:bg-slate-800 hover:bg-[#E4E7D3] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Full PDF
                    </a>
                  )}
                </div>

                {/* Clinical Notes */}
                {selectedRx.diagnosis_summary?.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200 block mb-1">
                      Clinical Notes & Diagnosis:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedRx.diagnosis_summary.notes}
                    </p>
                  </div>
                )}

                {/* Previously Prescribed Medicines with Import Option */}
                {Array.isArray(selectedRx.diagnosis_summary?.medicines) &&
                  selectedRx.diagnosis_summary.medicines.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-[#4A5D23] dark:text-lime-400" />
                          Past Medications ({selectedRx.diagnosis_summary.medicines.length})
                        </span>

                        {onImportMedicines && (
                          <button
                            onClick={() => {
                              onImportMedicines(selectedRx.diagnosis_summary?.medicines || [])
                              alert('Past medications imported into current prescription form!')
                            }}
                            className="text-xs text-[#4A5D23] dark:text-lime-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy all to active Rx
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {selectedRx.diagnosis_summary.medicines.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {med}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(med)
                                setCopiedMedIndex(idx)
                                setTimeout(() => setCopiedMedIndex(null), 1500)
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Copy name"
                            >
                              {copiedMedIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Embedded PDF Viewer for Side-by-Side Review */}
                {selectedRx.presignedUrl ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Archived Prescription Preview:
                    </span>
                    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <iframe
                        src={`${selectedRx.presignedUrl}#toolbar=0`}
                        className="w-full h-full bg-white"
                        title="Archived PDF"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-500">
                    PDF document key: {selectedRx.b2_object_key}
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                Select a visit from the left column to view previous consultation details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E4E7D3] dark:border-slate-800 flex items-center justify-between bg-[#F8FAF6] dark:bg-slate-800/40">
          <span className="text-xs text-slate-500">
            Records secured via Backblaze B2 Private Vault
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4A5D23] hover:bg-[#3d4d1c] dark:bg-lime-600 cursor-pointer"
          >
            Return to Active Consultation
          </button>
        </div>
      </div>
    </div>
  )
}
