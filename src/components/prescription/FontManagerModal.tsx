'use client'

import React, { useRef, useState } from 'react'
import { X, Upload, Type, Trash2, ChevronDown } from 'lucide-react'
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

  if (!isOpen) return null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['ttf', 'otf', 'woff'].includes(ext ?? '')) {
      setError('Only .ttf, .otf, and .woff fonts are supported.')
      return
    }
    setError(null)
    setUploading(true)

    const reader = new FileReader()
    reader.onload = ev => {
      const base64 = ev.target?.result as string
      const fontName = file.name.replace(/\.[^.]+$/, '')
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
      setError('Failed to read font file.')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card, #fff)',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
          width: 520,
          maxWidth: '92vw',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Type size={20} color="#0891b2" />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--foreground, #134e4a)', fontFamily: 'Outfit, Geist, sans-serif' }}>
              Font Manager
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              padding: 6,
              display: 'flex',
              color: 'var(--muted-foreground, #64748b)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f1f5f9')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* Upload section */}
          <div
            style={{
              border: '2px dashed var(--border, #e2e8f0)',
              borderRadius: 14,
              padding: 24,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
              marginBottom: 20,
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = '#0891b2' }}
            onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #e2e8f0)' }}
            onDrop={e => {
              e.preventDefault();
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #e2e8f0)'
              const file = e.dataTransfer.files[0]
              if (file && fileRef.current) {
                const dt = new DataTransfer()
                dt.items.add(file)
                fileRef.current.files = dt.files
                fileRef.current.dispatchEvent(new Event('change', { bubbles: true }))
              }
            }}
          >
            <Upload size={28} color="#0891b2" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground, #134e4a)', marginBottom: 4 }}>
              {uploading ? 'Processing...' : 'Upload Custom Font'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground, #64748b)' }}>
              Drag &amp; drop or click — .ttf, .otf, .woff supported
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".ttf,.otf,.woff"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>
              {error}
            </p>
          )}

          {/* Web-safe fonts */}
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground, #64748b)', marginBottom: 10 }}>
            Web-Safe Fonts
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {WEB_SAFE_FONTS.map(f => (
              <span
                key={f}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid var(--border, #e2e8f0)',
                  fontSize: 13,
                  fontFamily: f,
                  color: 'var(--foreground, #134e4a)',
                  background: 'var(--muted, #f0f9ff)',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Custom fonts */}
          {fonts.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground, #64748b)', marginBottom: 10 }}>
                Uploaded Fonts ({fonts.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fonts.map(font => (
                  <div
                    key={font.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      border: '1px solid var(--border, #e2e8f0)',
                      borderRadius: 10,
                      background: 'var(--muted, #f0f9ff)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Type size={15} color="#0891b2" />
                      <span style={{ fontFamily: font.name, fontSize: 14, color: 'var(--foreground, #134e4a)' }}>
                        {font.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted-foreground, #64748b)', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                        .{font.format}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveFont(font.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626',
                        padding: 4,
                        borderRadius: 6,
                        display: 'flex',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border, #e2e8f0)', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
