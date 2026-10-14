'use client'

import React, { useRef, useState } from 'react'
import { X, Upload, Type, Trash2, CheckCircle2 } from 'lucide-react'
import type { CustomFont } from './types'
import { WEB_SAFE_FONTS } from './types'

interface FontManagerModalProps {
  isOpen: boolean
  fonts: CustomFont[]
  onClose: () => void
  onAddFont: (font: CustomFont) => void
  onRemoveFont: (id: string) => void
}

export default function FontManagerModal({
  isOpen,
  fonts,
  onClose,
  onAddFont,
  onRemoveFont,
}: FontManagerModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  if (!isOpen) return null

  function processFontFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['ttf', 'otf', 'woff'].includes(ext ?? '')) {
      setError('Only .ttf, .otf, and .woff font files are supported.')
      return
    }

    setError(null)
    setUploading(true)

    const reader = new FileReader()
    reader.onload = ev => {
      const base64 = ev.target?.result as string
      const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\-\s]/g, '')
      onAddFont({
        id: crypto.randomUUID(),
        name: fontName,
        base64Data: base64,
        format: ext as CustomFont['format'],
      })
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.onerror = () => {
      setError('Failed to read custom font file.')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFontFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFontFile(file)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-[#4A5D23]/5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D23] text-white flex items-center justify-center shadow-sm">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Font Management System</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage pre-installed & custom uploaded .ttf / .otf fonts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            aria-label="Close font manager"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-600 dark:text-slate-300">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#4A5D23] bg-[#4A5D23]/10 scale-[1.01]'
                : 'border-slate-300 dark:border-white/20 hover:border-[#4A5D23] bg-slate-50 dark:bg-white/5'
            }`}
          >
            <input
              type="file"
              ref={fileRef}
              accept=".ttf,.otf,.woff"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-[#4A5D23] mx-auto mb-2.5 opacity-80" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
              {uploading ? 'Injecting Font...' : 'Upload Custom Font File'}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Drag & drop or browse .ttf or .otf font files. Fonts are converted to Base64 and dynamically injected into the UI & PDF generator.
            </p>
          </div>

          {/* Pre-installed Web-Safe Fonts */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Pre-Installed Standard Fonts ({WEB_SAFE_FONTS.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {WEB_SAFE_FONTS.map(f => (
                <div
                  key={f}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between"
                  style={{ fontFamily: f }}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{f}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
                </div>
              ))}
            </div>
          </div>

          {/* Custom Uploaded Fonts */}
          <div className="space-y-2.5 pt-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Custom Uploaded Fonts ({fonts.length})</span>
            </h4>
            {fonts.length === 0 ? (
              <p className="text-slate-400 italic text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 text-center">
                No custom fonts uploaded yet. Upload a .ttf or .otf file above to customize your typography.
              </p>
            ) : (
              <div className="space-y-2">
                {fonts.map(font => (
                  <div
                    key={font.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between"
                  >
                    <div className="min-w-0" style={{ fontFamily: font.name }}>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm">{font.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{font.format} • Dynamically Injected</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFont(font.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Remove font"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#4A5D23] hover:bg-[#3B4A1C] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
