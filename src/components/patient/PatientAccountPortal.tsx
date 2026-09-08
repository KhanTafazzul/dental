'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Camera, ShieldCheck, CheckCircle2,
  Trash2, AlertTriangle, Link as LinkIcon, Lock, Save, RefreshCw,
  Heart, AlertCircle, Sparkles, LogOut, ChevronRight, FileText, Check, Shield
} from 'lucide-react'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import DpdpModal from '@/components/DpdpModal'

export interface PatientProfile {
  id: string
  fullName: string
  email: string
  mobile: string
  avatarUrl?: string
  age?: number
  gender?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  allergies?: string
  medicalConditions?: string
  dentalHistory?: string
  googleLinked?: boolean
}

export default function PatientAccountPortal() {
  // Empty default template for real patient session
  const EMPTY_PROFILE: PatientProfile = {
    id: '',
    fullName: '',
    email: '',
    mobile: '',
    avatarUrl: '',
    age: undefined,
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalConditions: '',
    dentalHistory: '',
    googleLinked: false
  }

  // Initial & Editable Form States
  const [initialProfile, setInitialProfile] = useState<PatientProfile>(EMPTY_PROFILE)
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE)
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'medical' | 'linked' | 'privacy' | 'danger'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDpdpModal, setShowDpdpModal] = useState(false)

  // Load REAL patient data from localStorage session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('falix_patient_user')
      let loaded: PatientProfile = { ...EMPTY_PROFILE }

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          const nameStr = (parsed.fullName || '').trim()
          loaded = {
            id: parsed.uid || 'user_' + Date.now(),
            fullName: nameStr || (parsed.email ? parsed.email.split('@')[0] : 'Patient User'),
            email: parsed.email || '',
            mobile: parsed.mobile || '',
            avatarUrl: parsed.avatarUrl || '',
            age: parsed.age || undefined,
            gender: parsed.gender || '',
            address: parsed.address || '',
            emergencyContactName: parsed.emergencyContactName || '',
            emergencyContactPhone: parsed.emergencyContactPhone || '',
            allergies: parsed.allergies || '',
            medicalConditions: parsed.medicalConditions || '',
            dentalHistory: parsed.dentalHistory || '',
            googleLinked: parsed.avatarUrl?.includes('google') || parsed.googleLinked || true
          }
        } catch (e) {}
      } else {
        // Unauthenticated demo state
        loaded = {
          id: 'guest_user',
          fullName: 'Patient Account',
          email: 'patient@example.com',
          mobile: '',
          avatarUrl: '',
          gender: '',
          googleLinked: false
        }
      }

      setInitialProfile(loaded)
      setProfile(loaded)
    }
  }, [])

  // Save button remains disabled until input values differ from initial state
  const hasChanges = React.useMemo(() => {
    return JSON.stringify(profile) !== JSON.stringify(initialProfile)
  }, [profile, initialProfile])

  // Compute initials for profile photo fallback dynamically from real name
  const initialsFallback = React.useMemo(() => {
    if (!profile.fullName || profile.fullName === 'Patient Account') return 'P'
    const parts = profile.fullName.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
    }
    return profile.fullName.charAt(0).toUpperCase()
  }, [profile.fullName])

  // Photo Upload Handler
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0])
      setProfile(prev => ({ ...prev, avatarUrl: url }))
    }
  }

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    setIsSaving(true)
    try {
      await new Promise(res => setTimeout(res, 500))
      
      // Update session state in localStorage with real patient data
      if (typeof window !== 'undefined') {
        const sessionObj = {
          ...profile,
          email: profile.email.trim().toLowerCase(),
          fullName: profile.fullName,
          uid: profile.id,
          avatarUrl: profile.avatarUrl,
          loggedInAt: new Date().toISOString()
        }
        localStorage.setItem('falix_patient_user', JSON.stringify(sessionObj))
        window.dispatchEvent(new Event('falix_auth_changed'))
      }

      setInitialProfile(profile)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Toast Notification for Save Confirmation */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-teal-900/90 to-cyan-900/90 border border-teal-400/50 text-teal-100 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
            <span>Patient Profile and Account Preferences saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#06120f] via-[#0c1a17] to-[#040c0a] border border-emerald-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          
          {/* Profile Photo with Real Avatar or Initials Fallback */}
          <div className="relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-teal-400/40 shadow-xl shadow-teal-500/10 bg-gradient-to-br from-teal-600 to-cyan-800 flex items-center justify-center text-white text-3xl font-serif font-bold relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{initialsFallback}</span>
              )}
            </div>

            {/* Change Photo Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-3xl bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer"
            >
              <Camera className="w-5 h-5 mb-1 text-teal-300" />
              <span>Upload Photo</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5 justify-center sm:justify-start">
              {profile.fullName || 'Patient Profile'}
              <span className="text-[10px] font-mono font-semibold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                Verified Patient
              </span>
            </h1>

            <p className="text-xs text-slate-300 mt-1">
              Account Email: <span className="text-teal-300 font-mono font-medium">{profile.email || 'Not connected'}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 justify-center sm:justify-start">
              {profile.mobile && <span>Phone: {profile.mobile}</span>}
              {profile.gender && <span>Gender: {profile.gender}</span>}
              <span className="text-teal-400 font-medium">DPDP Act 2023 Compliant</span>
            </div>
          </div>
        </div>

        {/* Save Action Button */}
        <div className="z-10 w-full md:w-auto">
          <motion.button
            type="button"
            whileHover={{ scale: hasChanges ? 1.03 : 1 }}
            whileTap={{ scale: hasChanges ? 0.97 : 1 }}
            onClick={handleSaveProfile}
            disabled={!hasChanges || isSaving}
            className="w-full md:w-auto py-3 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-teal-300/40"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasChanges ? 'Save Changes' : 'No Unsaved Changes'}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-2">
          <div className="p-2 rounded-3xl bg-[#0c1a17]/90 border border-emerald-500/20 space-y-1">
            
            {[
              { id: 'profile', label: 'Display Name & Identity', icon: User },
              { id: 'contact', label: 'Contact & Personal Details', icon: Mail },
              { id: 'medical', label: 'Medical & Dental History', icon: FileText },
              { id: 'linked', label: 'Linked Accounts', icon: LinkIcon },
              { id: 'privacy', label: 'DPDP Privacy & Compliance', icon: ShieldCheck },
              { id: 'danger', label: 'Danger Zone & Account Erasure', icon: Trash2 },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isDanger = tab.id === 'danger'

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer z-10 ${
                    isActive
                      ? isDanger
                        ? 'text-rose-300 font-bold'
                        : 'text-white font-bold'
                      : isDanger
                      ? 'text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAccountTabPill"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={`absolute inset-0 rounded-2xl -z-10 ${
                        isDanger
                          ? 'bg-rose-500/20 border border-rose-500/40'
                          : 'bg-gradient-to-r from-teal-500/25 to-cyan-500/15 border border-teal-400/40'
                      }`}
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? (isDanger ? 'text-rose-400' : 'text-teal-300') : ''}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>
              )
            })}

          </div>
        </div>

        {/* Content Panel Area */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-6">
            
            {/* TAB 1: PROFILE & DISPLAY NAME */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Display Name & Basic Profile</h2>
                  <p className="text-xs text-slate-400">
                    Your display name is printed on doctor diagnosis reports, prescriptions, and booking receipts.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Display Name (Full Legal Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="e.g. Aman Khan"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={profile.age || ''}
                        onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
                        placeholder="e.g. 29"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={profile.gender || ''}
                        onChange={e => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="">Select Gender...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: CONTACT INFORMATION */}
            {activeTab === 'contact' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Contact & Address Details</h2>
                  <p className="text-xs text-slate-400">
                    Manage your email address, phone number, and emergency contact details.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      placeholder="e.g. patient@example.com"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.mobile}
                      onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Home Address
                    </label>
                    <textarea
                      rows={2}
                      value={profile.address || ''}
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                      placeholder="Enter house number, street, city..."
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Emergency Contact Person
                      </label>
                      <input
                        type="text"
                        value={profile.emergencyContactName || ''}
                        onChange={e => setProfile({ ...profile, emergencyContactName: e.target.value })}
                        placeholder="Relative / Family Name"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={profile.emergencyContactPhone || ''}
                        onChange={e => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                        placeholder="+91 Phone Number"
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: MEDICAL HISTORY */}
            {activeTab === 'medical' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Medical & Dental History</h2>
                  <p className="text-xs text-slate-400">
                    Disclosing allergies and medical history allows doctors to choose safe dental anesthetics and medications.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Known Drug Allergies & Sensitivities
                    </label>
                    <input
                      type="text"
                      value={profile.allergies || ''}
                      onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                      placeholder="e.g. Penicillin, Latex, NSAIDs (or 'None')"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Chronic Medical Conditions
                    </label>
                    <input
                      type="text"
                      value={profile.medicalConditions || ''}
                      onChange={e => setProfile({ ...profile, medicalConditions: e.target.value })}
                      placeholder="e.g. Diabetes, Hypertension, Asthma (or 'None')"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Previous Dental Surgeries & Treatments
                    </label>
                    <textarea
                      rows={2}
                      value={profile.dentalHistory || ''}
                      onChange={e => setProfile({ ...profile, dentalHistory: e.target.value })}
                      placeholder="e.g. Tooth Extraction, Root Canal, Braces..."
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: LINKED ACCOUNTS */}
            {activeTab === 'linked' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Linked Identity Accounts</h2>
                  <p className="text-xs text-slate-400">
                    Manage connected sign-in accounts and single sign-on (SSO) providers.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.6 7.5 23 12 23z" />
                      </svg>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Google SSO Authentication</h4>
                        <p className="text-[11px] text-slate-400">
                          {profile.googleLinked ? `Connected with ${profile.email}` : 'Not connected'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, googleLinked: !profile.googleLinked })}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        profile.googleLinked ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30' : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                      }`}
                    >
                      {profile.googleLinked ? 'Disconnect' : 'Connect Account'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: DPDP PRIVACY & COMPLIANCE */}
            {activeTab === 'privacy' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    DPDP Act 2023 Data Privacy & Consent
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review statutory data processing consents under the Digital Personal Data Protection Act 2023.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-semibold text-white">Data Consent Status:</span>
                    <span className="text-teal-400 font-bold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                      Granted & Active
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your personal information and medical diagnosis reports are encrypted with 256-bit SSL protocols. You hold full statutory right to inspect, correct, or request account erasure.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowDpdpModal(true)}
                    className="py-2.5 px-4 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4" /> View Full DPDP Compliance Statement
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 6: DANGER ZONE & DELETION */}
            {activeTab === 'danger' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Danger Zone & Account Erasure
                  </h2>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Options to deactivate or permanently erase your patient account credentials.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Permanently Delete Patient Account</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Immediately revokes login credentials, cancels pending online appointments, and processes statutory data erasure.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit Footer Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {hasChanges ? '⚠️ Unsaved edits detected' : '✓ Profile up to date'}
              </span>

              <motion.button
                type="submit"
                whileHover={{ scale: hasChanges ? 1.03 : 1 }}
                whileTap={{ scale: hasChanges ? 0.97 : 1 }}
                disabled={!hasChanges || isSaving}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 text-slate-950 shadow-md hover:opacity-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-teal-300/40"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </motion.button>
            </div>

          </form>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        patientEmail={profile.email}
      />

      {/* DPDP Act Compliance Modal */}
      <DpdpModal
        isOpen={showDpdpModal}
        onClose={() => setShowDpdpModal(false)}
      />
    </div>
  )
}
