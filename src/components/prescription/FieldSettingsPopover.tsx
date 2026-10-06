'use client'

import React from 'react'
import { Trash2, Type, Palette, Maximize2, Tag, Key } from 'lucide-react'
import type { BoundingField, CustomFont } from './types'
import { WEB_SAFE_FONTS } from './types'

interface FieldSettingsPopoverProps {
  field: BoundingField
  customFonts: CustomFont[]
  onChange: (updated: BoundingField) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const COLOR_PRESETS = [
  '#1e293b', // Slate 800
  '#0e7490', // Cyan 700
  '#0369a1', // Sky 700
  '#15803d', // Green 700
  '#b91c1c', // Red 700
  '#6b21a8', // Purple 700
  '#475569', // Slate 600
  '#000000', // Black
]

const KEY_OPTIONS = [
  { label: 'Patient Name', value: 'patientName' },
  { label: 'Age', value: 'age' },
  { label: 'Gender', value: 'gender' },
  { label: 'Date', value: 'date' },
  { label: 'Mobile Number', value: 'mobile' },
  { label: 'Doctor Name', value: 'doctorName' },
  { label: 'Medicines List', value: 'medicines' },
  { label: 'Clinical Notes', value: 'notes' },
  { label: 'Custom Text Field', value: 'custom' },
]

export default function FieldSettingsPopover({
  field,
  customFonts,
  onChange,
  onDelete,
  onClose,
}: FieldSettingsPopoverProps) {
  const availableFonts = [
    ...WEB_SAFE_FONTS,
    ...customFonts.map(f => f.name),
  ]

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: 320,
        background: 'var(--card, #ffffff)',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border, #cbd5e1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        zIndex: 50,
        fontSize: 13,
        color: 'var(--foreground, #1e293b)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0e7490' }}>
          <Tag size={15} />
          <span>Field Settings</span>
        </div>
        <button
          onClick={() => onDelete(field.id)}
          title="Delete Field"
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: 'none',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>

      {/* Field Display Label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Display Label
        </label>
        <input
          type="text"
          value={field.name}
          onChange={e => onChange({ ...field, name: e.target.value })}
          placeholder="e.g. Patient Name"
          style={{
            padding: '7px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 13,
            outline: 'none',
            background: '#f8fafc',
          }}
        />
      </div>

      {/* Data Key Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Key size={12} /> Data Binding Key
        </label>
        <select
          value={field.key}
          onChange={e => {
            const selectedKey = e.target.value
            const matchOption = KEY_OPTIONS.find(o => o.value === selectedKey)
            onChange({
              ...field,
              key: selectedKey,
              name: matchOption && matchOption.value !== 'custom' ? matchOption.label : field.name,
            })
          }}
          style={{
            padding: '7px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 13,
            outline: 'none',
            background: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          {KEY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({opt.value})
            </option>
          ))}
        </select>
      </div>

      {/* Font Family & Size */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Type size={12} /> Font Family
          </label>
          <select
            value={field.fontFamily}
            onChange={e => onChange({ ...field, fontFamily: e.target.value })}
            style={{
              padding: '7px 8px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 12,
              outline: 'none',
              background: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            {availableFonts.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Size (px)
          </label>
          <input
            type="number"
            min={8}
            max={72}
            value={field.fontSize}
            onChange={e => onChange({ ...field, fontSize: Math.max(8, parseInt(e.target.value) || 12) })}
            style={{
              padding: '7px 8px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              background: '#f8fafc',
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      {/* Text Color Picker & Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Palette size={12} /> Text Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={field.color}
            onChange={e => onChange({ ...field, color: e.target.value })}
            style={{
              width: 32,
              height: 32,
              padding: 0,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              background: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {COLOR_PRESETS.map(c => (
              <button
                key={c}
                onClick={() => onChange({ ...field, color: c })}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: c,
                  border: field.color === c ? '2px solid #0891b2' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: field.color === c ? '0 0 0 2px rgba(8, 145, 178, 0.3)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dimensions & Position Fine-Tuning */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Maximize2 size={12} /> Position & Bounds (px)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
          {[
            { label: 'X', val: Math.round(field.x), key: 'x' },
            { label: 'Y', val: Math.round(field.y), key: 'y' },
            { label: 'W', val: Math.round(field.width), key: 'width' },
            { label: 'H', val: Math.round(field.height), key: 'height' },
          ].map(p => (
            <div key={p.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', borderRadius: 6, padding: '4px 6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{p.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{p.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <button
          onClick={onClose}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: '#0891b2',
            color: '#fff',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
