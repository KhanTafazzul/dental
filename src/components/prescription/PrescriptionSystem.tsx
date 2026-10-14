'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Sliders,
  Type,
  Download,
  Upload,
  RotateCcw,
  Printer,
  CreditCard,
  Sparkles,
  CheckCircle2,
  HardDrive
} from 'lucide-react'
import type { TemplateConfig, PatientBillingData, CustomFont } from './types'
import { DEFAULT_TEMPLATE_CONFIG, DEFAULT_BILLING_DATA, PRESET_FIELDS } from './types'
import FontInjector from './FontInjector'
import FontManagerModal from './FontManagerModal'
import TemplateBuilderCanvas from './TemplateBuilderCanvas'
import BillingDrawer from './BillingDrawer'
import AdminPrescriptionMasterLog from './AdminPrescriptionMasterLog'

const STORAGE_KEY = 'dental_rx_template_config'

interface PrescriptionSystemProps {
  embedded?: boolean
}

export default function PrescriptionSystem({ embedded = false }: PrescriptionSystemProps) {
  // Three main modes: "Template Builder Mode", "Billing Mode", and "B2 Cloud Archive & Master Log"
  const [mode, setMode] = useState<'builder' | 'billing' | 'archive'>('builder')
  const [fontModalOpen, setFontModalOpen] = useState(false)
  const [billingDrawerOpen, setBillingDrawerOpen] = useState(false)

  // Core Central State (Requirement: Core Architecture & State)
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG)

  // Doctor Patient Billing Data State
  const [billingData, setBillingData] = useState<PatientBillingData>(DEFAULT_BILLING_DATA)

  // Load saved template from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && Array.isArray(parsed.fields)) {
          setTemplateConfig(parsed)
          return
        }
      }
    } catch (e) {
      console.warn('Notice loading prescription template from storage:', e)
    }

    // Default initialization with preset fields
    setTemplateConfig({
      backgroundImage: null,
      customFonts: [],
      fields: PRESET_FIELDS.map(f => ({ ...f, id: crypto.randomUUID() })),
    })
  }, [])

  // Persist template changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templateConfig))
    } catch (e) {
      console.warn('Notice saving prescription template to storage:', e)
    }
  }, [templateConfig])

  // Custom Font Handlers
  function handleAddFont(font: CustomFont) {
    setTemplateConfig(prev => ({
      ...prev,
      customFonts: [...prev.customFonts, font],
    }))
  }

  function handleRemoveFont(id: string) {
    setTemplateConfig(prev => ({
      ...prev,
      customFonts: prev.customFonts.filter(f => f.id !== id),
    }))
  }

  // Export Template Configuration
  function handleExportTemplate() {
    const jsonStr = JSON.stringify(templateConfig, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Prescription_Template_Config.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import Template Configuration
  function handleImportTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed && Array.isArray(parsed.fields)) {
          setTemplateConfig(parsed)
          alert('Template imported successfully.')
        } else {
          alert('Invalid template JSON file format.')
        }
      } catch {
        alert('Failed to parse template JSON file.')
      }
    }
    reader.readAsText(file)
  }

  // Reset Template
  function handleResetDefault() {
    if (confirm('Are you sure you want to reset the prescription template layout to defaults?')) {
      const defaultConfig: TemplateConfig = {
        backgroundImage: null,
        customFonts: [],
        fields: PRESET_FIELDS.map(f => ({ ...f, id: crypto.randomUUID() })),
      }
      setTemplateConfig(defaultConfig)
    }
  }

  return (
    <div className={`flex flex-col w-full bg-slate-50 dark:bg-[#0c1412] text-slate-800 dark:text-slate-100 font-sans ${
      embedded ? 'rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden min-h-[800px]' : 'h-screen overflow-hidden'
    }`}>
      {/* Dynamic Font-Face Injector into Document Head */}
      <FontInjector fonts={templateConfig.customFonts} />

      {/* Font Manager Modal */}
      <FontManagerModal
        isOpen={fontModalOpen}
        fonts={templateConfig.customFonts}
        onClose={() => setFontModalOpen(false)}
        onAddFont={handleAddFont}
        onRemoveFont={handleRemoveFont}
      />

      {/* Sliding Billing Drawer */}
      <BillingDrawer
        isOpen={billingDrawerOpen}
        template={templateConfig}
        billingData={billingData}
        onClose={() => setBillingDrawerOpen(false)}
        onChangeBillingData={setBillingData}
        onResetBillingData={() => setBillingData(DEFAULT_BILLING_DATA)}
      />

      {/* ─── TOP CONTROL TOOLBAR ─── */}
      <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 shadow-xs z-20">
        
        {/* Left: Branding & Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A5D23] text-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              WYSIWYG Prescription Template Mapper &amp; Billing System
            </h2>
            <p className="text-[11px] text-slate-400">
              {mode === 'builder' ? 'Template Builder Mode (Admin Canvas)' : 'Billing Mode (Doctor Data Entry & Silent Print)'}
            </p>
          </div>
        </div>

        {/* Center: Mode Selector Toggle (Template Builder vs Billing Mode) */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setMode('builder')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mode === 'builder'
                ? 'bg-[#4A5D23] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Template Builder Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('billing')
              setBillingDrawerOpen(true)
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mode === 'billing'
                ? 'bg-[#4A5D23] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('archive')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mode === 'archive'
                ? 'bg-[#4A5D23] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>B2 Cloud Vault &amp; Master Log</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Font Management Dropdown/Button */}
          <button
            type="button"
            onClick={() => setFontModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Fonts ({templateConfig.customFonts.length})</span>
          </button>

          {/* Import Template */}
          <label className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
          </label>

          {/* Export Template */}
          <button
            type="button"
            onClick={handleExportTemplate}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Export</span>
          </button>

          {/* Reset Template */}
          <button
            type="button"
            onClick={handleResetDefault}
            title="Reset layout to default"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Billing Drawer Toggle Button */}
          {mode === 'billing' && (
            <button
              type="button"
              onClick={() => setBillingDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#4A5D23] hover:bg-[#3B4A1C] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ml-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Open Billing Drawer</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── MAIN BUILDER / BILLING / B2 CLOUD MASTER LOG ─── */}
      {mode === 'archive' ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <AdminPrescriptionMasterLog />
        </div>
      ) : (
        <main className="flex-1 p-5 overflow-hidden">
          <TemplateBuilderCanvas
            backgroundImage={templateConfig.backgroundImage}
            fields={templateConfig.fields}
            customFonts={templateConfig.customFonts}
            billingData={billingData}
            isBillingMode={mode === 'billing'}
            onUpdateFields={fields => setTemplateConfig(prev => ({ ...prev, fields }))}
            onSetBackgroundImage={base64 => setTemplateConfig(prev => ({ ...prev, backgroundImage: base64 }))}
          />
        </main>
      )}
    </div>
  )
}
