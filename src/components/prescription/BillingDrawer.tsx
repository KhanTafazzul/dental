'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  FileText,
  UserCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import type { PatientBillingData, MedicineEntry, TemplateConfig } from './types'
import { printPrescriptionPdf, downloadPrescriptionPdf } from './pdfGenerator'

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
  const [medName, setMedName] = useState('')
  const [medDosage, setMedDosage] = useState('')
  const [medFreq, setMedFreq] = useState('1-0-1')
  const [medDuration, setMedDuration] = useState('5 days')
  const [isGenerating, setIsGenerating] = useState(false)

  // Add Medicine Chip (Prescription Medicine)
  function handleAddMedicine() {
    if (!medName.trim()) return

    const newMed: MedicineEntry = {
      id: crypto.randomUUID(),
      name: medName.trim(),
      dosage: medDosage.trim(),
      frequency: medFreq.trim(),
      duration: medDuration.trim(),
    }

    onChangeBillingData({
      ...billingData,
      medicines: [...billingData.medicines, newMed],
    })

    setMedName('')
    setMedDosage('')
  }

  // Handle Enter Key inside medicine input
  function handleMedKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddMedicine()
    }
  }

  // Remove Medicine Chip
  function handleRemoveMedicine(id: string) {
    onChangeBillingData({
      ...billingData,
      medicines: billingData.medicines.filter(m => m.id !== id),
    })
  }

  // Print Action
  async function handlePrint() {
    try {
      setIsGenerating(true)
      await printPrescriptionPdf(template, billingData)
    } catch (err) {
      console.error('Print Error:', err)
      alert('Failed to generate printable prescription PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Download Action
  async function handleDownload() {
    try {
      setIsGenerating(true)
      const filename = `Prescription_${billingData.patientName.replace(/\s+/g, '_') || 'Patient'}_${billingData.date.replace(/\//g, '-')}.pdf`
      await downloadPrescriptionPdf(template, billingData, filename)
    } catch (err) {
      console.error('Download Error:', err)
      alert('Failed to download prescription PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 500,
            maxWidth: '100vw',
            background: '#ffffff',
            boxShadow: '-10px 0 40px rgba(74, 93, 35, 0.18)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #E4E7D3',
            borderRadius: '24px 0 0 24px',
            overflow: 'hidden',
            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E4E7D3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#4A5D23',
              color: '#ffffff',
              borderRadius: '24px 0 0 0',
            }}
          >
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
                Patient Billing &amp; Rx Entry
              </h2>
              <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.9 }}>
                Auto-synced with bill &amp; prescription PDF exporter
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 10,
                padding: 6,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>

        {/* Drawer Body Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Patient Personal Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={13} /> Patient Details
            </span>

            {/* Patient Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Patient Name *</label>
              <input
                type="text"
                value={billingData.patientName}
                onChange={e => onChangeBillingData({ ...billingData, patientName: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>

            {/* Age & Gender Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Age</label>
                <input
                  type="text"
                  value={billingData.age}
                  onChange={e => onChangeBillingData({ ...billingData, age: e.target.value })}
                  placeholder="e.g. 34 Yrs"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Gender</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['M', 'F', 'O'].map(g => (
                    <button
                      key={g}
                      onClick={() => onChangeBillingData({ ...billingData, gender: g })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: billingData.gender === g ? '1.5px solid #0891b2' : '1px solid #cbd5e1',
                        background: billingData.gender === g ? '#ecfeff' : '#ffffff',
                        color: billingData.gender === g ? '#0891b2' : '#64748b',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} /> Date
                </label>
                <input
                  type="text"
                  value={billingData.date}
                  onChange={e => onChangeBillingData({ ...billingData, date: e.target.value })}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} /> Mobile
                </label>
                <input
                  type="text"
                  value={billingData.mobile}
                  onChange={e => onChangeBillingData({ ...billingData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                />
              </div>
            </div>

            {/* Doctor Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserCheck size={12} /> Doctor Name
              </label>
              <input
                type="text"
                value={billingData.doctorName}
                onChange={e => onChangeBillingData({ ...billingData, doctorName: e.target.value })}
                placeholder="e.g. Dr. A. K. Sharma, MDS"
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

          {/* Medicines Entry Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pill size={13} /> Prescribed Medicines ({billingData.medicines.length})
            </span>

            {/* Add Medicine Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <input
                type="text"
                value={medName}
                onChange={e => setMedName(e.target.value)}
                onKeyDown={handleMedKeyDown}
                placeholder="Medicine Name (e.g. Amoxicillin)"
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <input
                  type="text"
                  value={medDosage}
                  onChange={e => setMedDosage(e.target.value)}
                  onKeyDown={handleMedKeyDown}
                  placeholder="Dosage (500mg)"
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <select
                  value={medFreq}
                  onChange={e => setMedFreq(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    outline: 'none',
                    background: '#ffffff',
                  }}
                >
                  <option value="1-0-1">1-0-1 (BD)</option>
                  <option value="1-1-1">1-1-1 (TDS)</option>
                  <option value="1-0-0">1-0-0 (OD AM)</option>
                  <option value="0-0-1">0-0-1 (OD PM)</option>
                  <option value="SOS">SOS (As needed)</option>
                </select>
                <input
                  type="text"
                  value={medDuration}
                  onChange={e => setMedDuration(e.target.value)}
                  onKeyDown={handleMedKeyDown}
                  placeholder="Duration (5 days)"
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>
              <button
                onClick={handleAddMedicine}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#0891b2',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  marginTop: 2,
                }}
              >
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            {/* Medicine Chips List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {billingData.medicines.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#ecfeff',
                    border: '1px solid #a5f3fc',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#0e7490', marginRight: 6 }}>
                      {idx + 1}. {m.name}
                    </span>
                    <span style={{ color: '#475569' }}>
                      {m.dosage ? `(${m.dosage})` : ''} • {m.frequency} • {m.duration}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMedicine(m.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

          {/* Clinical Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileText size={12} /> Clinical Advice / Notes
            </label>
            <textarea
              rows={3}
              value={billingData.notes}
              onChange={e => onChangeBillingData({ ...billingData, notes: e.target.value })}
              placeholder="e.g. Avoid cold drinks. Warm saline gargles 3 times daily."
              style={{
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              style={{
                padding: '11px 16px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(8, 145, 178, 0.3)',
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              <Printer size={16} />
              {isGenerating ? 'Printing...' : 'Auto-Print'}
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              style={{
                padding: '11px 16px',
                borderRadius: 10,
                background: '#ffffff',
                color: '#0891b2',
                border: '1.5px solid #0891b2',
                fontWeight: 700,
                fontSize: 13,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              <Download size={16} />
              Save PDF
            </button>
          </div>

          <button
            onClick={onResetBillingData}
            style={{
              padding: '8px',
              borderRadius: 8,
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <RotateCcw size={13} />
            Reset Patient Form
          </button>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}
