'use client'

import React from 'react'
import { Trash2, Type, Palette, X, Sliders } from 'lucide-react'
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
  '#1e293b',
  '#4A5D23',
  '#0e7490',
  '#0369a1',
  '#15803d',
  '#b91c1c',
  '#6b21a8',
  '#000000',
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
      className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 space-y-4 font-sans select-none animate-scale-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 font-bold text-[#4A5D23] dark:text-[#A3B799]">
          <Sliders className="w-4 h-4" />
          <span>Field Box Settings</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDelete(field.id)}
            title="Delete this field box"
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Field Label Input */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Display Label</label>
        <input
          type="text"
          value={field.name}
          onChange={e => onChange({ ...field, name: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:outline-none focus:border-[#4A5D23]"
        />
      </div>

      {/* Font Family Selection (Requirement 1 & 2) */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#4A5D23]" /> Font Family
        </label>
        <select
          value={field.fontFamily}
          onChange={e => onChange({ ...field, fontFamily: e.target.value })}
          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium focus:outline-none focus:border-[#4A5D23]"
          style={{ fontFamily: field.fontFamily }}
        >
          <optgroup label="Standard Fonts">
            {WEB_SAFE_FONTS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </optgroup>
          {customFonts.length > 0 && (
            <optgroup label="Custom Uploaded Fonts">
              {customFonts.map(f => (
                <option key={f.id} value={f.name} style={{ fontFamily: f.name }}>{f.name}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Font Size Stepper & Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Font Size</span>
          <span className="font-mono font-bold text-[#4A5D23] dark:text-[#A3B799]">{field.fontSize}px</span>
        </div>
        <input
          type="range"
          min={8}
          max={48}
          step={1}
          value={field.fontSize}
          onChange={e => onChange({ ...field, fontSize: Number(e.target.value) })}
          className="w-full accent-[#4A5D23] cursor-pointer"
        />
      </div>

      {/* Hex Color Picker (Requirement 2) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#4A5D23]" /> Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={field.color || '#1e293b'}
            onChange={e => onChange({ ...field, color: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-white/20 p-0.5 bg-white"
          />
          <input
            type="text"
            value={field.color}
            onChange={e => onChange({ ...field, color: e.target.value })}
            className="flex-1 px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-xs focus:outline-none focus:border-[#4A5D23]"
          />
        </div>

        {/* Quick Color Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          {COLOR_PRESETS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...field, color: c })}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-md border transition-transform ${
                field.color === c ? 'scale-125 border-white ring-2 ring-[#4A5D23]' : 'border-black/10 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Box Position & Dimensions info */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-between text-[10px] text-slate-400 font-mono">
        <span>X: {Math.round(field.x)}px, Y: {Math.round(field.y)}px</span>
        <span>W: {Math.round(field.width)}px, H: {Math.round(field.height)}px</span>
      </div>
    </div>
  )
}
