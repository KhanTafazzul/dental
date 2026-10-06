import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Sparkles, ShieldCheck } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { verifyToken } from '@/lib/auth'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('dental_admin_token')
  const verifiedAdmin = await verifyToken(token?.value)
  const isValid = verifiedAdmin === 'admin'

  if (!isValid) {
    redirect('/admin/login')
  }

  return (
    <div
      className={`${outfit.variable} ${plusJakartaSans.variable} flex min-h-screen bg-[#F4F6F0] text-[#2C3325] antialiased selection:bg-[#E4E7D3] selection:text-[#4A5D23]`}
      style={{
        fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {/* ═══ DYNAMIC CAPSULE SIDEBAR ═══ */}
      <AdminSidebar />

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#F4F6F0',
        }}
      >
        {/* Top header bar */}
        <header
          className="bg-white/80 border-b border-[#E4E7D3] px-4 sm:px-8"
          style={{
            height: 68,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 2px 12px rgba(74, 93, 35, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="w-8 h-8 rounded-full bg-[#E4E7D3] flex items-center justify-center text-[#4A5D23]">
              <Sparkles size={16} />
            </div>
            <div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#2C3325',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                  letterSpacing: '-0.01em',
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                Clinic Administration System
              </span>
              <span style={{ fontSize: 10, color: '#8A9380', fontWeight: 600, letterSpacing: '0.05em' }}>
                EXECUTIVE CLINICAL CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4E7D3]/60 border border-[#E4E7D3] text-[#4A5D23] text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>Session Authenticated</span>
            </div>
            <Link
              href="/adminstration"
              className="text-[#4A5D23] bg-[#E4E7D3]/80 hover:bg-[#E4E7D3] border border-[#4A5D23]/20 hover:border-[#4A5D23]/40"
              style={{
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 12,
                transition: 'all 0.2s ease',
                letterSpacing: '-0.01em',
              }}
            >
              Public Gateway →
            </Link>
          </div>
        </header>

        {/* Page content container */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

