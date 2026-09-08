'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Camera, ShieldCheck, CheckCircle2,
  Trash2, AlertTriangle, Link as LinkIcon, Lock, Save, RefreshCw,
  Heart, AlertCircle, Sparkles, LogOut, ChevronRight, FileText, Check
} from 'lucide-react'
import DeleteAccountModal from '@/components/DeleteAccountModal'

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
  // Initial / Loaded State
  const [initialProfile, setInitialProfile] = useState<PatientProfile>({
    id: 'user_default',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    mobile: '+91 98765 43210',
    avatarUrl: '',
    age: 28,
    gender: 'Female',
    address: 'Sector 14, Hazara Road, City Center',
    emergencyContactName: 'Rajesh Sharma',
    emergencyContactPhone: '+91 98123 45678',
    allergies: 'Penicillin, Latex gloves',
    medicalConditions: 'None',
    dentalHistory: 'Root Canal Treatment (2025), Teeth Scaling',
    googleLinked: true
  })

  // Editable Form State
  const [profile, setProfile] = useState<PatientProfile>(initialProfile)
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'medical' | 'linked' | 'danger'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('falix_patient_user')
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          const loaded: PatientProfile = {
            ...initialProfile,
            id: parsed.uid || initialProfile.id,
            fullName: parsed.fullName || initialProfile.fullName,
            email: parsed.email || initialProfile.email,
            avatarUrl: parsed.avatarUrl || ''
          }
          setInitialProfile(loaded)
          setProfile(loaded)
        } catch (e) {}
      }
    }
  }, [])

  // Checklist Requirement 5: Save button remains disabled until there are changes
  const hasChanges = React.useMemo(() => {
    return JSON.stringify(profile) !== JSON.stringify(initialProfile)
  }, [profile, initialProfile])

  // Compute initials for profile photo fallback
  const initialsFallback = React.useMemo(() => {
    if (!profile.fullName) return 'P'
    const parts = profile.fullName.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
    }
    return profile.fullName.charAt(0).toUpperCase()
  }, [profile.fullName])

  // Handle Photo File Pick
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0])
      setProfile(prev => ({ ...prev, avatarUrl: url }))
    }
  }

  // Handle Form Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    setIsSaving(true)
    try {
      // Simulate backend save delay
      await new Promise(res => setTimeout(res, 600))
      
      // Update session state in localStorage
      if (typeof window !== 'undefined') {
        const sessionObj = {
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
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans selection:bg-teal-500/30">
      
      {/* Toast Notification for Save Confirmation */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-teal-900/90 border border-teal-400/40 text-teal-100 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
            <span>Profile and Account Preferences updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Hero Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          
          {/* Checklist Requirement 1: Profile photo with sensible initials fallback */}
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
              className="absolute inset-0 rounded-3xl bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer"
            >
              <Camera className="w-5 h-5 mb-1 text-teal-300" />
              <span>Change Photo</span>
            </button>
          </div>

          <div>
            {/* Checklist Requirement 2: Display name */}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5 justify-center sm:justify-start">
              {profile.fullName || 'Patient Profile'}
              <span className="text-xs font-mono font-normal text-teal-400 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                Verified Patient
              </span>
            </h1>

            <p className="text-xs text-slate-300 mt-1">
              Primary Account ID: <span className="text-teal-300 font-mono">{profile.email}</span>
            </p>

            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">
              <span>Mobile: {profile.mobile}</span>
              <span>•</span>
              <span>DPDP Consent Active</span>
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={!hasChanges || isSaving}
            className="w-full md:w-auto py-3 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasChanges ? 'Save Changes' : 'No Changes to Save'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Tabs (Sidebar) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="p-2 rounded-3xl bg-slate-900 border border-white/10 space-y-1">
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border border-teal-500/40 text-teal-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>Display Name & Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'contact' ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border border-teal-500/40 text-teal-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Contact & Personal Info</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('medical')}
              className={`w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'medical' ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border border-teal-500/40 text-teal-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Medical & Dental History</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('linked')}
              className={`w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'linked' ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border border-teal-500/40 text-teal-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4" />
                <span>Linked Accounts</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'danger' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' : 'text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4" />
                <span>Danger Zone & Deletion</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-6">
            
            {/* TAB 1: PROFILE & DISPLAY NAME */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Display Name & Identity</h2>
                  <p className="text-xs text-slate-400">
                    Your display name is shown across clinic prescriptions, doctor reports, and booking confirmations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Full Legal Name (Display Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      This is the name printed on diagnostic reports and clinic receipts.
                    </p>
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
                        onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={profile.gender || 'Female'}
                        onChange={e => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT INFORMATION */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Contact & Address Details</h2>
                  <p className="text-xs text-slate-400">
                    Update your primary email, mobile phone number, and residential address.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Email Address (Account Username)
                    </label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={profile.mobile}
                      onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Residential Home Address
                    </label>
                    <textarea
                      rows={2}
                      value={profile.address || ''}
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                      placeholder="Enter house/street address..."
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
                        placeholder="e.g. Spouse / Relative Name"
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
              </div>
            )}

            {/* TAB 3: MEDICAL HISTORY */}
            {activeTab === 'medical' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Medical & Dental History</h2>
                  <p className="text-xs text-slate-400">
                    Disclosing allergies and medical history helps doctors prescribe safe dental medications.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Known Allergies & Drug Sensitivities
                    </label>
                    <input
                      type="text"
                      value={profile.allergies || ''}
                      onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                      placeholder="e.g. Penicillin, Latex, NSAIDs"
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
                      placeholder="e.g. Diabetes, Asthma, Hypertension"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Previous Dental Surgeries / Treatments
                    </label>
                    <textarea
                      rows={2}
                      value={profile.dentalHistory || ''}
                      onChange={e => setProfile({ ...profile, dentalHistory: e.target.value })}
                      placeholder="e.g. Root Canal, Extractions, Braces..."
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LINKED ACCOUNTS */}
            {activeTab === 'linked' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-1">Linked Third-Party Accounts</h2>
                  <p className="text-xs text-slate-400">
                    Manage connected sign-in identity providers and authentication security.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Google Account */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.6 7.5 23 12 23z" />
                      </svg>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Google Identity Provider</h4>
                        <p className="text-[11px] text-slate-400">
                          {profile.googleLinked ? `Connected as ${profile.email}` : 'Not connected'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, googleLinked: !profile.googleLinked })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        profile.googleLinked ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30' : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                      }`}
                    >
                      {profile.googleLinked ? 'Disconnect' : 'Connect Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DANGER ZONE & DELETION */}
            {activeTab === 'danger' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Danger Zone & Permanent Account Deletion
                  </h2>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Options to deactivate or permanently erase your patient account under the Digital Personal Data Protection (DPDP) Act 2023.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Permanently Delete Patient Account</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Immediately deletes your login credentials, revokes active appointments, and processes data erasure.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {hasChanges ? '⚠️ Unsaved changes pending' : '✓ All changes saved'}
              </span>

              {/* Checklist Requirement 5: Save button disabled until changes exist */}
              <button
                type="submit"
                disabled={!hasChanges || isSaving}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-md hover:opacity-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* DPDP Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        patientEmail={profile.email}
      />
    </div>
  )
}
