'use client'

import React, { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { Plus, Image as ImageIcon, Trash2, Layers, Move, Eye } from 'lucide-react'
import type { BoundingField, CustomFont, PatientBillingData } from './types'
import { CANVAS_WIDTH, CANVAS_HEIGHT, PRESET_FIELDS } from './types'
import FieldSettingsPopover from './FieldSettingsPopover'

interface TemplateBuilderCanvasProps {
  backgroundImage: string | null
  fields: BoundingField[]
  customFonts: CustomFont[]
  billingData?: PatientBillingData
  isBillingMode?: boolean
  onUpdateFields: (fields: BoundingField[]) => void
  onSetBackgroundImage: (base64: string | null) => void
}

export default function TemplateBuilderCanvas({
  backgroundImage,
  fields,
  customFonts,
  billingData,
  isBillingMode = false,
  onUpdateFields,
  onSetBackgroundImage,
}: TemplateBuilderCanvasProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
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
          name: 'New Custom Field',
          key: 'custom',
          x: 60,
          y: 60 + fields.length * 40,
          width: 200,
          height: 36,
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

  // Get field text content depending on mode
  function getFieldDisplayValue(field: BoundingField): string {
    if (!isBillingMode || !billingData) {
      return `[ ${field.name} ]`
    }

    if (field.key === 'medicines') {
      if (!billingData.medicines || billingData.medicines.length === 0) {
        return `[ Prescription Medicines Area ]`
      }
      return billingData.medicines
        .map(
          (m, i) =>
            `${i + 1}. ${m.name} ${m.dosage ? `(${m.dosage})` : ''} - ${m.frequency} ${m.duration ? `[${m.duration}]` : ''}`
        )
        .join('\n')
    }

    if (field.key === 'notes') {
      return billingData.notes || `[ Clinical Notes Area ]`
    }

    const val = (billingData as any)[field.key]
    return val ? String(val) : `[ ${field.name} ]`
  }

  return (
    <div style={{ display: 'flex', gap: 24, width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* ─── LEFT CONTROL TOOLBOX (Builder Mode Only) ────────────── */}
      {!isBillingMode && (
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: 'var(--card, #ffffff)',
            borderRadius: 20,
            padding: 20,
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            height: 'fit-content',
            maxHeight: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={20} color="#0891b2" />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--foreground, #134e4a)', fontFamily: 'Outfit, sans-serif' }}>
              Template Toolbox
            </span>
          </div>

          {/* Background Image Uploader */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Background Prescription Layout
            </span>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleBgUpload}
            />
            {backgroundImage ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => bgInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <ImageIcon size={14} color="#0891b2" />
                  Change Background
                </button>
                <button
                  onClick={() => onSetBackgroundImage(null)}
                  title="Remove Background"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => bgInputRef.current?.click()}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#0891b2',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
              >
                <ImageIcon size={16} />
                Upload Background Image
              </button>
            )}
          </div>

          {/* Quick Add Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Add Standard Bounding Fields
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PRESET_FIELDS.map(preset => {
                const isAdded = fields.some(f => f.key === preset.key)
                return (
                  <button
                    key={preset.key}
                    onClick={() => handleAddField(preset)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: isAdded ? '1px solid #0891b2' : '1px solid #e2e8f0',
                      background: isAdded ? '#ecfeff' : '#ffffff',
                      color: isAdded ? '#0891b2' : '#334155',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{preset.name}</span>
                    <Plus size={13} color={isAdded ? '#0891b2' : '#94a3b8'} />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => handleAddField()}
              style={{
                marginTop: 4,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)',
              }}
            >
              <Plus size={15} />
              Add Custom Box
            </button>
          </div>

          {/* Active Field List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Fields ({fields.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {fields.map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: selectedFieldId === f.id ? '#e0f2fe' : '#f8fafc',
                    border: selectedFieldId === f.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    fontWeight: 600,
                    color: selectedFieldId === f.id ? '#0369a1' : '#334155',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Move size={12} color="#94a3b8" />
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleRemoveField(f.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN A4 CANVAS AREA ─────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'auto',
          padding: 20,
          background: 'var(--muted, #f1f5f9)',
          borderRadius: 20,
          position: 'relative',
        }}
        onClick={() => setSelectedFieldId(null)}
      >
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            position: 'relative',
            background: '#ffffff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            borderRadius: 4,
            overflow: 'hidden',
            flexShrink: 0,
            transformOrigin: 'top center',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Background Image Layer */}
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt="Prescription Background"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          )}

          {/* Bounding Box Layers */}
          {fields.map(field => {
            const isSelected = selectedFieldId === field.id && !isBillingMode

            if (isBillingMode) {
              // Read-only canvas rendering for Billing mode preview
              return (
                <div
                  key={field.id}
                  style={{
                    position: 'absolute',
                    left: field.x,
                    top: field.y,
                    width: field.width,
                    height: field.height,
                    color: field.color || '#1e293b',
                    fontFamily: field.fontFamily || 'Arial',
                    fontSize: `${field.fontSize}px`,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    pointerEvents: 'none',
                  }}
                >
                  {getFieldDisplayValue(field)}
                </div>
              )
            }

            return (
              <Rnd
                key={field.id}
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
                style={{
                  border: isSelected ? '2px dashed #0891b2' : '1px dashed rgba(8, 145, 178, 0.4)',
                  background: isSelected ? 'rgba(8, 145, 178, 0.08)' : 'rgba(8, 145, 178, 0.02)',
                  borderRadius: 4,
                  boxSizing: 'border-box',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: 4,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    color: field.color || '#1e293b',
                    fontFamily: field.fontFamily || 'Arial',
                    fontSize: `${field.fontSize}px`,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    userSelect: 'none',
                  }}
                >
                  {field.name}
                </div>

                {/* Floating inline settings popover positioning */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: field.y + field.height + 340 > CANVAS_HEIGHT ? -335 : field.height + 8,
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
      </div>
    </div>
  )
}
