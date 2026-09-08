'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '../actions'
import { Shield, Key, AlertCircle, Loader2, Sparkles, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import DentalLogo from '@/components/DentalLogo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await loginAdmin(password)
      if (res.success) {
        router.refresh()
        router.push('/admin')
      } else {
        setError(res.error || 'Incorrect passcode')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden bg-gradient-to-br from-[#06120f] via-[#0b1f1a] to-[#040c0a] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-teal-500/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[#0c1a17]/90 backdrop-blur-2xl border border-emerald-500/25 shadow-[0_25px_60px_rgba(0,0,0,0.75)] rounded-3xl p-8 sm:p-10 relative z-10">
        
        {/* Top Header Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <DentalLogo iconOnly={false} size={34} />
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif text-white font-bold tracking-tight">
            Clinic Control Console
          </h1>
          <p className="text-xs text-emerald-400/80 font-light mt-1.5 uppercase tracking-widest">
            Secured Owner & Doctor Login
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Admin Passcode
            </label>
            <div className="relative group">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-emerald-900/40 focus:outline-none focus:border-emerald-500 transition-all bg-[#050f0c] text-white placeholder-emerald-700/60"
              />
            </div>
            <p className="text-[11px] text-emerald-600/80 font-light">
              Hint: Confidential clinic owner passcode required.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-300/40 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Authorizing Access...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enter Control Console</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link 
            href="/"
            className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors font-medium"
          >
            ← Return to Patient Gateway
          </Link>
        </div>

      </div>
    </div>
  )
}
