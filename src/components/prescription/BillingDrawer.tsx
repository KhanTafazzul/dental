'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Printer,
  Download,
  Plus,
  Trash2,
  User,
  Phone,
  Calendar,
  Pill,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  CloudUpload,
  Stethoscope,
  Mail,
  Building2,
  Award,
} from 'lucide-react'
import type { PatientBillingData, MedicineEntry, TemplateConfig, PrintOptions } from './types'
import { printPrescriptionPdf, downloadPrescriptionPdf, uploadPrescriptionToCloud } from './pdfGenerator'

interface BillingDrawerProps {
  isOpen: boolean
  template: TemplateConfig
  billingData: PatientBillingData
  onClose: () => void
  onChangeBillingData: (data: PatientBillingData) => void
  onResetBillingData: () => void
}

export default function BillingDrawer({
  isOpen,
  template,
  billingData,
  onClose,
  onChangeBillingData,
  onResetBillingData,
}: BillingDrawerProps) {
  const [medicineInput, setMedicineInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Print Mode State: Print Background Pad & Print Text Data
  const [printBackground, setPrintBackground] = useState(template.printOptions?.printBackground ?? true)
  const [printText, setPrintText] = useState(template.printOptions?.printText ?? true)

  // Sync with template printOptions if updated
  useEffect(() => {
    if (template.printOptions) {
      setPrintBackground(template.printOptions.printBackground)
      setPrintText(template.printOptions.printText)
    }
  }, [template.printOptions])

  // If drawer is closed, do not render in DOM to avoid accidental popup on side
  if (!isOpen) return null

  const currentPrintOptions: PrintOptions = {
    printBackground,
    printText,
  }

  // Append new medicine to array (Requirement 3)
  function handleAddMedicine() {
    if (!medicineInput.trim()) return

    const newMed: MedicineEntry = {
      id: crypto.randomUUID(),
      name: medicineInput.trim(),
    }

    onChangeBillingData({
      ...billingData,
      medicines: [...billingData.medicines, newMed],
    })

    setMedicineInput('')
  }

  // Handle Enter key for rapid medicine entry
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddMedicine()
    }
  }

  // Remove medicine from array
  function handleRemoveMedicine(index: number) {
    const updated = [...billingData.medicines]
    updated.splice(index, 1)
    onChangeBillingData({
      ...billingData,
      medicines: updated,
    })
  }

  // Requirement 4: Generate Bill & Print with PrintOptions (Background and/or Text)
  async function handleGenerateBillAndPrint() {
    setIsGenerating(true)
    setStatusMessage(null)
    try {
      const pdfBlob = await printPrescriptionPdf(template, billingData, currentPrintOptions)
      setStatusMessage({
        text: `Bill triggered for print (${printText && !printBackground ? 'Text-only mode for pre-printed letterhead' : printText && printBackground ? 'Full print mode' : 'Custom mode'}).`,
        type: 'success',
      })
      console.log('Generated PDF Blob for backend attachment:', pdfBlob)
    } catch (err: any) {
      console.error('Print generation error:', err)
      setStatusMessage({ text: err.message || 'Failed to generate printable bill.', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Download PDF with PrintOptions
  async function handleDownloadBill() {
    setIsGenerating(true)
    setStatusMessage(null)
    try {
      const modeSuffix = printText && !printBackground ? '_TextOnly' : ''
      const filename = `Prescription_${billingData.patientName.replace(/\s+/g, '_') || 'Patient'}_${billingData.date.replace(/\//g, '-')}${modeSuffix}.pdf`
      await downloadPrescriptionPdf(template, billingData, filename, currentPrintOptions)
      setStatusMessage({ text: 'Prescription PDF downloaded successfully.', type: 'success' })
    } catch (err: any) {
      console.error('Download error:', err)
      setStatusMessage({ text: err.message || 'Failed to download PDF.', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Cloud Sync to Backblaze B2 & Multi-Channel Dispatch (WAHA + Email)
  async function handleCloudSyncAndDispatch() {
    if (!billingData.patientName) {
      setStatusMessage({ text: 'Please enter patient name before saving.', type: 'error' })
      return
    }

    setIsGenerating(true)
    setStatusMessage(null)
    try {
      const res = await uploadPrescriptionToCloud({
        template,
        billingData,
        patientId: billingData.patientId || crypto.randomUUID(),
        doctorId: billingData.doctorId || undefined,
        channels: { whatsapp: true, email: true },
        printOptions: currentPrintOptions,
      })

      if (res.success) {
        setStatusMessage({
          text: `Prescription saved to Backblaze B2 vault & queued for WhatsApp dispatch! (Visit #${res.prescription?.visit_number || 1})`,
          type: 'success',
        })
      } else {
        setStatusMessage({
          text: res.error || 'Notice: Upload recorded with fallback.',
          type: 'error',
        })
      }
    } catch (err: any) {
      console.error('Cloud sync error:', err)
      setStatusMessage({ text: err.message || 'Failed to sync to cloud.', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Requirement 3: Sliding Billing Drawer
          Styling: fixed, top: 0, right: 0, height: 100vh, width: 400px, z-index: 50
          Animation: Tailwind translate-x-full when closed, translate-x-0 when open, transition-transform duration-300 */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[400px] max-w-full z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-[#4A5D23] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Prescription & Billing Drawer</h2>
              <p className="text-[11px] text-white/80">Doctor data entry & print engine</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close billing drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification Callout */}
        {statusMessage && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Drawer Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-200">
          
          {/* Standard Input: Patient Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Patient Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={billingData.patientName}
                onChange={e => onChangeBillingData({ ...billingData, patientName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
              />
            </div>
          </div>

          {/* Standard Inputs: Age & Date in Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Age
              </label>
              <input
                type="text"
                value={billingData.age}
                onChange={e => onChangeBillingData({ ...billingData, age: e.target.value })}
                placeholder="e.g. 28"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={billingData.date}
                  onChange={e => onChangeBillingData({ ...billingData, date: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Standard Input: Mobile */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={billingData.mobile}
                onChange={e => onChangeBillingData({ ...billingData, mobile: e.target.value })}
                placeholder="+91 98200 12345"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
              />
            </div>
          </div>

          {/* Medicine Entry (Requirement 3: Dynamic List) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-[#4A5D23]" /> Medicine Entry
              </label>
              <span className="text-[10px] text-slate-400">Hit Enter or click Add</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={medicineInput}
                onChange={e => setMedicineInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Amoxicillin 500mg (1-0-1 x 5 days)"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23]"
              />
              <button
                type="button"
                onClick={handleAddMedicine}
                disabled={!medicineInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#4A5D23] hover:bg-[#3B4A1C] text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Added Medicines Dynamic List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
              {billingData.medicines.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
                  No medicines added yet. Type a prescription item above.
                </p>
              ) : (
                billingData.medicines.map((item, idx) => {
                  const label = typeof item === 'string' ? item : item.name
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-4 h-4 rounded-full bg-[#4A5D23]/15 text-[#4A5D23] dark:text-[#A3B799] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Doctor & Clinic Information Section (Requirement: Doctor Name, Mobile, Email, etc.) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#4A5D23]" /> Doctor &amp; Clinic Information
              </label>
              <span className="text-[10px] text-slate-400">Prints in Doctor Bounding Boxes</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Doctor Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={billingData.doctorName || ''}
                    onChange={e => onChangeBillingData({ ...billingData, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Doctor Name"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Doctor Mobile</label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={billingData.doctorMobile || ''}
                      onChange={e => onChangeBillingData({ ...billingData, doctorMobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Doctor Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={billingData.doctorEmail || ''}
                      onChange={e => onChangeBillingData({ ...billingData, doctorEmail: e.target.value })}
                      placeholder="doctor@clinic.com"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Qualification</label>
                  <div className="relative">
                    <Award className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={billingData.doctorDegree || ''}
                      onChange={e => onChangeBillingData({ ...billingData, doctorDegree: e.target.value })}
                      placeholder="e.g. BDS, MDS"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Reg. Number</label>
                  <input
                    type="text"
                    value={billingData.doctorRegNo || ''}
                    onChange={e => onChangeBillingData({ ...billingData, doctorRegNo: e.target.value })}
                    placeholder="e.g. REG-2024-8891"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Hospital / Clinic</label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={billingData.clinicName || ''}
                      onChange={e => onChangeBillingData({ ...billingData, clinicName: e.target.value })}
                      placeholder="e.g. Hospital Name"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Patient Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={billingData.email || ''}
                      onChange={e => onChangeBillingData({ ...billingData, email: e.target.value })}
                      placeholder="patient@email.com"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23] font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Clinical Notes */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Clinical Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={billingData.notes || ''}
              onChange={e => onChangeBillingData({ ...billingData, notes: e.target.value })}
              placeholder="e.g. Maintain soft food diet for 48 hours..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#4A5D23]"
            />
          </div>
        </div>

        {/* Drawer Action Footer with Print Mode Checkboxes (Requirement: Tick boxes for bg and text) */}
        <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-3">
          
          {/* Print Background & Text Checkboxes */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#4A5D23]" /> Print Settings
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] dark:text-[#A3B799]">
                {printBackground && printText
                  ? 'Both (Full Pad + Text)'
                  : printText
                    ? 'Text Only (Pre-printed Pad)'
                    : printBackground
                      ? 'Background Only'
                      : 'None'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer select-none hover:border-[#4A5D23] transition">
                <input
                  type="checkbox"
                  checked={printBackground}
                  onChange={e => setPrintBackground(e.target.checked)}
                  className="w-4 h-4 accent-[#4A5D23] rounded cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Print Background Pad</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer select-none hover:border-[#4A5D23] transition">
                <input
                  type="checkbox"
                  checked={printText}
                  onChange={e => setPrintText(e.target.checked)}
                  className="w-4 h-4 accent-[#4A5D23] rounded cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Print Text Data</span>
              </label>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
              {printText && !printBackground ? (
                <span className="text-[#4A5D23] dark:text-[#A3B799] font-medium">
                  ★ Text-only: Only prints dynamic text where boxes are placed (fits pre-printed stationery).
                </span>
              ) : printText && printBackground ? (
                <span>✓ Full: Prints letterhead background image along with doctor and patient text.</span>
              ) : (
                <span>Select at least Text Data or Background Pad to print.</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateBillAndPrint}
            disabled={isGenerating || (!printBackground && !printText)}
            className="w-full py-3 rounded-xl bg-[#4A5D23] hover:bg-[#3B4A1C] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            <span>Generate Bill &amp; Print</span>
          </button>

          <button
            type="button"
            onClick={handleCloudSyncAndDispatch}
            disabled={isGenerating || (!printBackground && !printText)}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Save to B2 Vault &amp; Dispatch WAHA</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadBill}
              disabled={isGenerating || (!printBackground && !printText)}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              type="button"
              onClick={onResetBillingData}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Clear Form
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
