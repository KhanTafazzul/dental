'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Receipt, Stethoscope, X, Check, Paperclip, AlertCircle } from 'lucide-react'

export interface PatientAttachmentRecord {
  id: string
  patientName: string
  type: 'invoice' | 'prescription' | 'report' | 'xray'
  title: string
  date: string
  amount?: number
  fileUrl?: string
  doctorName?: string
  notes?: string
}

interface SharePatientRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRecord: (record: PatientAttachmentRecord) => void
  appointments?: any[]
}

export default function SharePatientRecordModal({
  isOpen,
  onClose,
  onSelectRecord,
  appointments = []
}: SharePatientRecordModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'prescription' | 'xray'>('all')

  // Map real appointments into attachable records
  const records: PatientAttachmentRecord[] = React.useMemo(() => {
    const list: PatientAttachmentRecord[] = []
    
    // Sample / Mock fallbacks if appointments are empty
    if (!appointments || appointments.length === 0) {
      return [
        {
          id: 'rec-1',
          patientName: 'Priya Sharma',
          type: 'invoice',
          title: 'Root Canal & Ceramic Crown Invoice #INV-8821',
          date: '2026-09-08',
          amount: 4500,
          doctorName: 'Dr. A. K. Khan',
          notes: 'Subtotal Rs. 5000, 10% Discount Applied'
        },
        {
          id: 'rec-2',
          patientName: 'Priya Sharma',
          type: 'prescription',
          title: 'Post-Op Antibiotics & Pain Relief Prescription',
          date: '2026-09-08',
          doctorName: 'Dr. A. K. Khan',
          notes: 'Amoxicillin 500mg (1-0-1), Paracetamol 650mg'
        },
        {
          id: 'rec-3',
          patientName: 'Rahul Verma',
          type: 'xray',
          title: 'Digital Intraoral OPG X-Ray Scan',
          date: '2026-09-07',
          fileUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
          doctorName: 'Dr. Sarah Jenkins',
          notes: 'Mandibular Molar 38 Impacted Wisdom Tooth'
        },
        {
          id: 'rec-4',
          patientName: 'Vikram Singh',
          type: 'invoice',
          title: 'Full Scaling & Teeth Whitening Bill #INV-8819',
          date: '2026-09-06',
          amount: 2200,
          doctorName: 'Dr. Sarah Jenkins',
          notes: 'Completed in 45 mins'
        }
      ]
    }

    appointments.forEach(appt => {
      const pName = appt.patients?.name || appt.patient_name || 'Patient Record'
      const dName = appt.doctors?.name || 'Clinic Doctor'
      const date = appt.appointment_date || new Date().toISOString().substring(0, 10)

      // Prescription attachment
      if (appt.prescription_text || appt.prescription_url) {
        list.push({
          id: `presc-${appt.id}`,
          patientName: pName,
          type: 'prescription',
          title: `Prescription Report for ${pName}`,
          date,
          fileUrl: appt.prescription_url,
          doctorName: dName,
          notes: appt.prescription_text || 'Rx medications prescription file attached'
        })
      }

      // X-ray attachment
      if (appt.xray_url) {
        list.push({
          id: `xray-${appt.id}`,
          patientName: pName,
          type: 'xray',
          title: `Dental X-Ray Scan (${pName})`,
          date,
          fileUrl: appt.xray_url,
          doctorName: dName,
          notes: 'High-resolution digital X-Ray imaging scan'
        })
      }

      // Invoice / Bill attachment
      if (appt.invoices) {
        const invList = Array.isArray(appt.invoices) ? appt.invoices : [appt.invoices]
        invList.forEach((inv: any) => {
          if (!inv) return
          list.push({
            id: `inv-${inv.id || appt.id}`,
            patientName: pName,
            type: 'invoice',
            title: `Treatment Invoice #${inv.id?.substring(0, 8) || 'BILL'} (${pName})`,
            date,
            amount: Number(inv.total || 0),
            doctorName: dName,
            notes: `Subtotal Rs. ${inv.subtotal || inv.total}, Total Paid Rs. ${inv.total}`
          })
        })
      }
    })

    return list
  }, [appointments])

  const filteredRecords = records.filter(rec => {
    const matchesSearch =
      rec.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || rec.type === filterType
    return matchesSearch && matchesType
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Paperclip className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-semibold text-white">
                  Share Patient Record or Bill
                </h3>
                <p className="text-xs text-slate-400">
                  Select a prescription, X-ray, or treatment bill to send to colleague
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter bar */}
          <div className="p-4 space-y-3 bg-slate-950/30 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient name, invoice ID, or treatment..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'all' ? 'bg-teal-500 text-slate-950 font-semibold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => setFilterType('invoice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filterType === 'invoice' ? 'bg-teal-500 text-slate-950 font-semibold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Bills
              </button>
              <button
                onClick={() => setFilterType('prescription')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filterType === 'prescription' ? 'bg-teal-500 text-slate-950 font-semibold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Prescriptions
              </button>
              <button
                onClick={() => setFilterType('xray')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filterType === 'xray' ? 'bg-teal-500 text-slate-950 font-semibold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> X-Rays
              </button>
            </div>
          </div>

          {/* Records List */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No matching patient records found.
              </div>
            ) : (
              filteredRecords.map(record => (
                <div
                  key={record.id}
                  onClick={() => {
                    onSelectRecord(record)
                    onClose()
                  }}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/40 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      record.type === 'invoice' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      record.type === 'xray' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    }`}>
                      {record.type === 'invoice' ? <Receipt className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">
                        {record.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Patient: <span className="text-slate-200 font-medium">{record.patientName}</span> • {record.date}
                      </p>
                      {record.notes && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {record.amount !== undefined && (
                      <span className="inline-block text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mb-1">
                        Rs. {record.amount.toLocaleString()}
                      </span>
                    )}
                    <div className="text-[10px] text-teal-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1 justify-end">
                      Attach <Check className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
