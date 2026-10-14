'use client'

import React, { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { Plus, Image as ImageIcon, Trash2, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import type { BoundingField, CustomFont, PatientBillingData, PrintOptions } from './types'
import { CANVAS_WIDTH, CANVAS_HEIGHT, PRESET_FIELDS, DEFAULT_PRINT_OPTIONS } from './types'
import FieldSettingsPopover from './FieldSettingsPopover'
import { Printer, Stethoscope, User, Pill } from 'lucide-react'

interface TemplateBuilderCanvasProps {
  backgroundImage: string | null
  fields: BoundingField[]
  customFonts: CustomFont[]
  billingData?: PatientBillingData
  isBillingMode?: boolean
  printOptions?: PrintOptions
  onUpdateFields: (fields: BoundingField[]) => void
  onSetBackgroundImage: (base64: string | null) => void
  onUpdatePrintOptions?: (opts: PrintOptions) => void
}

export default function TemplateBuilderCanvas({
  backgroundImage,
  fields,
  customFonts,
  billingData,
  isBillingMode = false,
  printOptions = DEFAULT_PRINT_OPTIONS,
  onUpdateFields,
  onSetBackgroundImage,
  onUpdatePrintOptions,
}: TemplateBuilderCanvasProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(0.85)
  const [presetCategory, setPresetCategory] = useState<'all' | 'doctor' | 'patient' | 'medicines'>('all')
  const bgInputRef = useRef<HTMLInputElement>(null)

  const selectedField = fields.find(f => f.id === selectedFieldId)

  // Handle Background Image Upload
  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = ev => {
      onSetBackgroundImage(ev.target?.result as string)
      if (bgInputRef.current) bgInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  // Add field helper
  function handleAddField(preset?: Omit<BoundingField, 'id'>) {
    const newField: BoundingField = preset
      ? { ...preset, id: crypto.randomUUID() }
      : {
          id: crypto.randomUUID(),
          name: 'Custom Bounding Box',
          key: 'custom',
          x: 40,
          y: 60 + fields.length * 35,
          width: 220,
          height: 34,
          color: '#1e293b',
          fontFamily: 'Arial',
          fontSize: 13,
        }

    onUpdateFields([...fields, newField])
    setSelectedFieldId(newField.id)
  }

  // Update single field helper
  function handleUpdateSingleField(updated: BoundingField) {
    onUpdateFields(fields.map(f => (f.id === updated.id ? updated : f)))
  }

  // Remove field helper
  function handleRemoveField(id: string) {
    onUpdateFields(fields.filter(f => f.id !== id))
    if (selectedFieldId === id) setSelectedFieldId(null)
  }

  // Value preview in Billing Mode
  function getFieldDisplayValue(field: BoundingField): string {
    if (!isBillingMode || !billingData) {
      return `[ ${field.name} ]`
    }

    if (field.key === 'medicines') {
      if (!billingData.medicines || billingData.medicines.length === 0) {
        return `[ Prescription Medicines Area ]`
      }
      return billingData.medicines
        .map((m, i) => {
          if (typeof m === 'string') return `${i + 1}. ${m}`
          return `${i + 1}. ${m.name} ${m.dosage ? `(${m.dosage})` : ''} ${m.frequency ? `- ${m.frequency}` : ''}`
        })
        .join('\n')
    }

    if (field.key === 'notes') {
      return billingData.notes || `[ Clinical Notes Area ]`
    }

    if (field.key === 'doctorName') return billingData.doctorName || 'Dr. Doctor Name'
    if (field.key === 'doctorMobile') return billingData.doctorMobile || '+91 98765 43210'
    if (field.key === 'doctorEmail') return billingData.doctorEmail || 'doctor@dentalclinic.com'
    if (field.key === 'doctorDegree') return billingData.doctorDegree || 'BDS, MDS - Oral Surgery'
    if (field.key === 'doctorRegNo') return billingData.doctorRegNo || 'REG-2024-8891'
    if (field.key === 'clinicName') return billingData.clinicName || 'HOSPITAL NAME'
    if (field.key === 'clinicAddress') return billingData.clinicAddress || 'Clinic Address'
    if (field.key === 'email') return billingData.email || 'patient@example.com'
    if (field.key === 'gender') return billingData.gender || 'M'

    const val = (billingData as any)[field.key]
    return val !== undefined && val !== '' ? String(val) : `[ ${field.name} ]`
  }

  // Filter presets based on selected category tab
  const filteredPresets = PRESET_FIELDS.filter(preset => {
    if (presetCategory === 'all') return true
    if (presetCategory === 'doctor') {
      return ['doctorName', 'doctorMobile', 'doctorEmail', 'doctorDegree', 'doctorRegNo', 'clinicName', 'clinicAddress'].includes(preset.key)
    }
    if (presetCategory === 'patient') {
      return ['patientName', 'age', 'date', 'mobile', 'email', 'gender'].includes(preset.key)
    }
    if (presetCategory === 'medicines') {
      return ['medicines', 'notes'].includes(preset.key)
    }
    return true
  })

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[600px] overflow-hidden select-none">
      
      {/* ─── LEFT SIDEBAR: FIELD & CANVAS TOOLBOX (Builder Mode Only) ─── */}
      {!isBillingMode && (
        <aside className="w-full lg:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-5 flex flex-col gap-4.5 shrink-0 shadow-sm overflow-y-auto">
          
          {/* Background Upload Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              1. Blank Prescription Design
            </span>
            <input
              type="file"
              ref={bgInputRef}
              accept="image/*"
              onChange={handleBgUpload}
              className="hidden"
            />
            {backgroundImage ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Replace
                </button>
                <button
                  type="button"
                  onClick={() => onSetBackgroundImage(null)}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 transition cursor-pointer"
                  title="Remove background"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#4A5D23]/40 hover:border-[#4A5D23] bg-[#4A5D23]/5 text-[#4A5D23] dark:text-[#A3B799] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ImageIcon className="w-4 h-4" /> Upload Blank Prescription Pad
              </button>
            )}
          </div>

          {/* 2. Print Output Settings (Requirement: Option to print background and/or text with tick boxes) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#4A5D23]" /> 2. Print Settings
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] dark:text-[#A3B799]">
                {printOptions.printBackground && printOptions.printText
                  ? 'Both (Full)'
                  : printOptions.printText
                    ? 'Text Only'
                    : printOptions.printBackground
                      ? 'Pad Only'
                      : 'None'}
              </span>
            </div>

            <div className="space-y-1.5 pt-0.5">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 cursor-pointer select-none hover:border-[#4A5D23] transition">
                <input
                  type="checkbox"
                  checked={printOptions.printBackground}
                  onChange={e => onUpdatePrintOptions?.({ ...printOptions, printBackground: e.target.checked })}
                  className="w-4 h-4 accent-[#4A5D23] rounded cursor-pointer"
                />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Print Background Pad</span>
                  <span className="text-[10px] text-slate-400">Blank letterhead image graphic</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 cursor-pointer select-none hover:border-[#4A5D23] transition">
                <input
                  type="checkbox"
                  checked={printOptions.printText}
                  onChange={e => onUpdatePrintOptions?.({ ...printOptions, printText: e.target.checked })}
                  className="w-4 h-4 accent-[#4A5D23] rounded cursor-pointer"
                />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Print Text Data</span>
                  <span className="text-[10px] text-slate-400">Where boxes are placed only</span>
                </div>
              </label>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal pt-0.5">
              {printOptions.printText && !printOptions.printBackground ? (
                <span className="text-[#4A5D23] dark:text-[#A3B799] font-medium">
                  ★ Text-only active: When placed, only text data will print at box coordinates (for pre-printed stationery).
                </span>
              ) : printOptions.printText && printOptions.printBackground ? (
                <span>✓ Full mode: Prints background letterhead graphic together with patient &amp; doctor text data.</span>
              ) : (
                <span>Tick boxes to customize print output.</span>
              )}
            </p>
          </div>

          {/* 3. Preset Bounding Boxes (Requirement: doctor name, mobile, email, etc.) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                3. Add Bounding Boxes
              </span>
              {/* Category Filter Tabs */}
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPresetCategory('all')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${presetCategory === 'all' ? 'bg-[#4A5D23] text-white font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategory('doctor')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${presetCategory === 'doctor' ? 'bg-[#4A5D23] text-white font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategory('patient')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${presetCategory === 'patient' ? 'bg-[#4A5D23] text-white font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  Patient
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredPresets.map(preset => {
                const isAdded = fields.some(f => f.key === preset.key)
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleAddField(preset)}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isAdded
                        ? 'border-[#4A5D23] bg-[#4A5D23]/10 text-[#4A5D23] dark:text-[#A3B799]'
                        : 'border-slate-200 dark:border-white/10 hover:border-[#4A5D23] bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate text-[11px]">{preset.name}</span>
                    <Plus className="w-3 h-3 shrink-0" />
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => handleAddField()}
              className="w-full py-2 px-3 rounded-xl bg-[#4A5D23] hover:bg-[#3B4A1C] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Custom Field Box
            </button>
          </div>

          {/* Active Field Boxes List */}
          <div className="space-y-2 flex-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Active Fields ({fields.length})</span>
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {fields.map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    selectedFieldId === f.id
                      ? 'border-[#4A5D23] bg-[#4A5D23]/10 text-[#4A5D23] dark:text-[#A3B799]'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  <div className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        handleRemoveField(f.id)
                      }}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span>Canvas View</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.max(0.4, z - 0.1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold w-10 text-center">{Math.round(zoomScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.min(1.2, z + 0.1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.85)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ─── MAIN CANVAS AREA: A4 ASPECT RATIO ─── */}
      <main
        className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex justify-center items-start relative"
        onClick={() => setSelectedFieldId(null)}
      >
        <div
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
          }}
          className="relative bg-white shadow-2xl rounded-sm overflow-hidden shrink-0 border border-slate-200 transition-transform duration-150"
          onClick={e => e.stopPropagation()}
        >
          {/* Background Image Layer */}
          {backgroundImage ? (
            <>
              <img
                src={backgroundImage}
                alt="Prescription Background Pad"
                className={`absolute inset-0 w-full h-full object-fill pointer-events-none select-none transition-opacity duration-200 ${
                  !printOptions.printBackground ? 'opacity-25 filter grayscale' : 'opacity-100'
                }`}
              />
              {!printOptions.printBackground && (
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-amber-500/90 text-white text-[10px] font-bold shadow-sm pointer-events-none z-20 flex items-center gap-1">
                  <span>★ Text-Only Pad Mode (Background will NOT print)</span>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-white/10 m-8 rounded-2xl pointer-events-none">
              <ImageIcon className="w-16 h-16 mb-2 opacity-40" />
              <p className="font-bold text-sm">Upload Blank Prescription Pad Template</p>
              <p className="text-xs opacity-70">A4 Ratio (794 x 1123 px)</p>
            </div>
          )}

          {/* Render Fields via react-rnd */}
          {fields.map(field => {
            const isSelected = selectedFieldId === field.id && !isBillingMode

            // In Billing Mode, render clean static overlay
            if (isBillingMode) {
              return (
                <div
                  key={field.id}
                  style={{
                    position: 'absolute',
                    left: `${field.x}px`,
                    top: `${field.y}px`,
                    width: `${field.width}px`,
                    height: `${field.height}px`,
                    color: field.color || '#1e293b',
                    fontFamily: field.fontFamily || 'Arial',
                    fontSize: `${field.fontSize}px`,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    textOverflow: 'ellipsis',
                    whiteSpace: field.key === 'medicines' || field.key === 'notes' ? 'pre-wrap' : 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {getFieldDisplayValue(field)}
                </div>
              )
            }

            // In Builder Mode, render draggable and resizable Rnd box with strict boundary enforcement
            return (
              <Rnd
                key={field.id}
                scale={zoomScale}
                size={{ width: field.width, height: field.height }}
                position={{ x: field.x, y: field.y }}
                onDragStart={() => setSelectedFieldId(field.id)}
                onDragStop={(e, d) => {
                  handleUpdateSingleField({ ...field, x: d.x, y: d.y })
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  handleUpdateSingleField({
                    ...field,
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position,
                  })
                }}
                bounds="parent"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setSelectedFieldId(field.id)
                }}
                className={`transition-colors cursor-move flex items-start justify-start p-1 box-border rounded select-none ${
                  isSelected
                    ? 'border-2 border-dashed border-[#4A5D23] bg-[#4A5D23]/10 ring-2 ring-[#4A5D23]/30 z-30'
                    : 'border border-dashed border-sky-500/70 bg-sky-500/5 hover:border-[#4A5D23] z-10'
                }`}
              >
                {/* STRICT BOUNDARY ENFORCED INNER BOX: overflow: hidden, word-wrap: break-word, text-overflow: ellipsis */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    color: field.color || '#1e293b',
                    fontFamily: field.fontFamily || 'Arial',
                    fontSize: `${field.fontSize}px`,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {field.name}
                </div>

                {/* Inline Field Settings Popover */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: field.y + field.height + 360 > CANVAS_HEIGHT ? -360 : field.height + 8,
                      left: Math.min(0, CANVAS_WIDTH - field.x - 330),
                      zIndex: 100,
                    }}
                  >
                    <FieldSettingsPopover
                      field={field}
                      customFonts={customFonts}
                      onChange={handleUpdateSingleField}
                      onDelete={handleRemoveField}
                      onClose={() => setSelectedFieldId(null)}
                    />
                  </div>
                )}
              </Rnd>
            )
          })}
        </div>
      </main>
    </div>
  )
}
