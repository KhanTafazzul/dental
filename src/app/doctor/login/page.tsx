'use client'

import React, { useState } from 'react'
import { loginDoctorUniversal } from '@/app/admin/actions'
import { Stethoscope, Key, AlertCircle, Loader2, Sparkles, UserCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import DentalLogo from '@/components/DentalLogo'

export default function UniversalDoctorLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await loginDoctorUniversal(identifier, password)
      if (res.success && res.slug) {
        window.location.href = `/doctor/${res.slug}`
        return
      } else {
        setError(res.error || 'Invalid doctor credentials')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred during authentication.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden bg-gradient-to-br from-[#0a140f] via-[#10221a] to-[#08100c] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/15 blur-[110px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-600/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[#0f211c]/90 backdrop-blur-2xl border border-emerald-500/25 shadow-[0_25px_60px_rgba(0,0,0,0.8)] rounded-3xl p-8 sm:p-10 relative z-10">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <DentalLogo iconOnly={false} size={34} />
          </Link>
          <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            Doctor Portal
          </span>
        </div>

        {/* Doctor Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4A5D23] to-[#364419] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#4A5D23]/30 border border-emerald-400/30">
            <Stethoscope className="w-8 h-8 text-emerald-300" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dentist Sign-In
          </h1>
          <p className="text-xs text-emerald-400/80 font-medium mt-1.5">
            Enter your Doctor Name or Email & Security Password
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Doctor Name / Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Doctor Name or Email
            </label>
            <div className="relative group">
              <UserCheck className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500 group-focus-within:text-emerald-300 transition-colors" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Nadeem Khan or nadeem@dental.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500 transition-all bg-[#081511] text-white placeholder-emerald-700/60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Security Passcode
            </label>
            <div className="relative group">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500 group-focus-within:text-emerald-300 transition-colors" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500 transition-all bg-[#081511] text-white placeholder-emerald-700/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#4A5D23] via-[#5c7244] to-[#748c56] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4A5D23]/30 border border-emerald-400/30 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Login to Doctor Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-4 border-t border-emerald-900/40">
          <Link 
            href="/"
            className="text-xs text-emerald-400 hover:text-emerald-200 transition-colors font-medium"
          >
            ← Return to Main Website
          </Link>
        </div>

      </div>
    </div>
  )
}
