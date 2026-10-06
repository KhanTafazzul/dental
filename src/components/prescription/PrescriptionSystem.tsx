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
} from 'lucide-react'
import type { TemplateConfig, PatientBillingData, CustomFont } from './types'
import { DEFAULT_TEMPLATE_CONFIG, DEFAULT_BILLING_DATA, PRESET_FIELDS } from './types'
import FontInjector from './FontInjector'
import FontManagerModal from './FontManagerModal'
import TemplateBuilderCanvas from './TemplateBuilderCanvas'
import BillingDrawer from './BillingDrawer'

const STORAGE_KEY = 'dental_rx_template_config'

export default function PrescriptionSystem() {
  const [mode, setMode] = useState<'builder' | 'billing'>('builder')
  const [fontModalOpen, setFontModalOpen] = useState(false)
  const [billingDrawerOpen, setBillingDrawerOpen] = useState(false)

  // Core Template Configuration State
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG)

  // Patient Billing Form Data State
  const [billingData, setBillingData] = useState<PatientBillingData>(DEFAULT_BILLING_DATA)

  // Load from LocalStorage on mount
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
      console.warn('Failed to load prescription template from local storage:', e)
    }

    // Default initialization with preset fields if empty
    setTemplateConfig({
      backgroundImage: null,
      customFonts: [],
      fields: PRESET_FIELDS.map(f => ({ ...f, id: crypto.randomUUID() })),
    })
  }, [])

  // Save to LocalStorage whenever template changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templateConfig))
    } catch (e) {
      console.warn('Failed to save prescription template to local storage:', e)
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

  // Template Export as JSON file
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

  // Template Import from JSON file
  function handleImportTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed && Array.isArray(parsed.fields)) {
          setTemplateConfig(parsed)
          alert('Prescription template imported successfully!')
        } else {
          alert('Invalid template JSON file structure.')
        }
      } catch (err) {
        alert('Failed to parse template JSON file.')
      }
    }
    reader.readAsText(file)
  }

  // Reset Template to Defaults
  function handleResetDefault() {
    if (confirm('Are you sure you want to reset the prescription template to default settings?')) {
      const defaultConfig: TemplateConfig = {
        backgroundImage: null,
        customFonts: [],
        fields: PRESET_FIELDS.map(f => ({ ...f, id: crypto.randomUUID() })),
      }
      setTemplateConfig(defaultConfig)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'var(--background, #f8fafc)',
        color: 'var(--foreground, #0f172a)',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Font-Face Injector */}
      <FontInjector fonts={templateConfig.customFonts} />

      {/* Font Manager Modal */}
      <FontManagerModal
        isOpen={fontModalOpen}
        fonts={templateConfig.customFonts}
        onClose={() => setFontModalOpen(false)}
        onAddFont={handleAddFont}
        onRemoveFont={handleRemoveFont}
      />

      {/* Sliding Patient Billing Drawer */}
      <BillingDrawer
        isOpen={billingDrawerOpen}
        template={templateConfig}
        billingData={billingData}
        onClose={() => setBillingDrawerOpen(false)}
        onChangeBillingData={setBillingData}
        onResetBillingData={() => setBillingData(DEFAULT_BILLING_DATA)}
      />

      {/* ─── TOP SYSTEM BAR ─────────────────────────────────────── */}
      <header
        style={{
          height: 68,
          padding: '0 24px',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          background: 'var(--card, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {/* Title Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif', color: 'var(--foreground, #134e4a)' }}>
              Rx Template Mapper &amp; Billing Engine
            </h1>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              WYSIWYG Dental Prescription Builder &amp; PDF Printer
            </span>
          </div>
        </div>

        {/* Mode Selector Segmented Pill Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={() => setMode('builder')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: mode === 'builder' ? '#ffffff' : 'transparent',
              color: mode === 'builder' ? '#0891b2' : '#64748b',
              boxShadow: mode === 'builder' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Sliders size={15} />
            1. Template Builder
          </button>

          <button
            onClick={() => {
              setMode('billing')
              setBillingDrawerOpen(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: mode === 'billing' ? '#ffffff' : 'transparent',
              color: mode === 'billing' ? '#0891b2' : '#64748b',
              boxShadow: mode === 'billing' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <CreditCard size={15} />
            2. Billing &amp; Live Print Mode
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Font Manager Button */}
          <button
            onClick={() => setFontModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <Type size={14} color="#0891b2" />
            Fonts ({templateConfig.customFonts.length})
          </button>

          {/* Import JSON */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <Upload size={14} color="#0891b2" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImportTemplate} style={{ display: 'none' }} />
          </label>

          {/* Export JSON */}
          <button
            onClick={handleExportTemplate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <Download size={14} color="#0891b2" />
            Export JSON
          </button>

          {/* Reset Template */}
          <button
            onClick={handleResetDefault}
            title="Reset to default template layout"
            style={{
              padding: '8px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
          </button>

          {/* Open Billing Drawer Button when in Billing mode */}
          {mode === 'billing' && (
            <button
              onClick={() => setBillingDrawerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)',
              }}
            >
              <Printer size={15} />
              Open Billing Drawer
            </button>
          )}
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────── */}
      <main style={{ flex: 1, padding: 20, overflow: 'hidden' }}>
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
    </div>
  )
}
