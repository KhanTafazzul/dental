'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  changeAdminPassword, updateBranchHours, addTimeSlot, 
  deleteTimeSlot, updateCameraPasscode, addTreatment, 
  updateTreatmentPrice, getAllMedicines, saveMedicineStock,
  updateBranchCaptureMedicine, updateAdminProfile, updateAdminSecurityPassword,
  resetClinicSettingsAction
} from '@/app/admin/actions';
import { supabase } from '@/lib/supabase';
import { getMessagingSettings, saveMessagingSettings, MessagingSettings } from '@/lib/messaging';
import { useTheme } from '@/components/ThemeContext';
import { 
  Settings, Key, Server, Mail, ShieldAlert, 
  CheckCircle, Loader2, Clock, Edit2, Check, X, 
  Trash2, Plus, Camera, Activity, DollarSign, Barcode, Inbox,
  Shield, Building2, Stethoscope, Pill, Download, Upload, Video, MessageSquare, Send,
  User, Bell, CreditCard, Globe, AlertTriangle, CheckCircle2, Lock, Eye, EyeOff, Save,
  Sun, Moon, Sparkles, ExternalLink, ChevronRight, Laptop
} from 'lucide-react';

export default function SettingsClient() {
  const { theme, toggleTheme } = useTheme();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'branches' | 'treatments' | 'medicines' | 'notifications' | 'billing' | 'preferences' | 'danger'>('account');

  // Feedback Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 1. Account Details State
  const [fullName, setFullName] = useState('Dr. Hazara & Family Dental Admin');
  const [email, setEmail] = useState('admin@dentalclinic.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [designation, setDesignation] = useState('Chief Dental Officer & Administrator');
  const [primaryBranch, setPrimaryBranch] = useState('Hazara Dental Clinic');
  const [savingAccount, setSavingAccount] = useState(false);

  const handleSaveAccount = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const res = await updateAdminProfile({ fullName, email, phone, designation, primaryBranch });
      if (res.success) {
        showToast('Account details updated successfully!');
      } else {
        showToast(res.error || 'Failed to update account details', 'error');
      }
    } catch (err) {
      showToast('Error updating account details', 'error');
    } finally {
      setSavingAccount(false);
    }
  }, [fullName, email, phone, designation, primaryBranch, showToast]);

  // 2. Security Details State (Requires Re-Authentication)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Re-authentication required: Please enter your current password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await updateAdminSecurityPassword(currentPassword, newPassword);
      if (res.success) {
        showToast('Security password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.error || 'Password update failed', 'error');
      }
    } catch (err) {
      showToast('Error changing password', 'error');
    } finally {
      setChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, showToast]);

  // 3. Operational Data (Loaded On-Demand when Branch / Treatment / Medicine tabs are opened)
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(false);

  // Lazy Data Loaders
  useEffect(() => {
    if (activeTab === 'branches' && branches.length === 0) {
      setLoadingBranches(true);
      supabase.from('branches').select('*').order('name')
        .then(({ data }) => setBranches(data || []))
        .finally(() => setLoadingBranches(false));
    } else if (activeTab === 'treatments' && treatments.length === 0) {
      setLoadingTreatments(true);
      supabase.from('treatments').select('*').order('name', { ascending: true })
        .then(({ data }) => setTreatments(data || []))
        .finally(() => setLoadingTreatments(false));
    } else if (activeTab === 'medicines' && medicines.length === 0) {
      setLoadingMeds(true);
      getAllMedicines('hazara')
        .then(res => res.success && res.data && setMedicines(res.data))
        .finally(() => setLoadingMeds(false));
    }
  }, [activeTab, branches.length, treatments.length, medicines.length]);

  // 4. Notification Preferences
  const [notifications, setNotifications] = useState({
    appointments: { email: true, whatsapp: true, inapp: true },
    reminders: { whatsapp: true, sms: false, inapp: true },
    doctorDispatches: { email: true, whatsapp: true, inapp: true },
    billingStock: { email: true, whatsapp: false, inapp: true },
  });

  const toggleNotif = useCallback((category: keyof typeof notifications, channel: 'email' | 'whatsapp' | 'sms' | 'inapp') => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !(prev[category] as any)[channel]
      }
    }));
    showToast('Notification preference saved!');
  }, [notifications, showToast]);

  // 5. Additional Preferences State
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // 6. Danger Zone State
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerActionType, setDangerActionType] = useState<'reset' | 'clear_logs' | 'delete_account'>('reset');
  const [confirmInput, setConfirmInput] = useState('');
  const [processingDanger, setProcessingDanger] = useState(false);

  const handleExecuteDangerAction = useCallback(async () => {
    if (confirmInput !== 'RESET' && confirmInput !== 'DELETE') {
      showToast('Confirmation failed. Please type the exact confirmation keyword.', 'error');
      return;
    }

    setProcessingDanger(true);
    try {
      if (dangerActionType === 'reset') {
        const res = await resetClinicSettingsAction(confirmInput);
        if (res.success) {
          showToast('Clinic settings have been restored to default.');
        } else {
          showToast(res.error || 'Reset failed', 'error');
        }
      } else if (dangerActionType === 'clear_logs') {
        showToast('Audit logs and message history cleared.');
      } else if (dangerActionType === 'delete_account') {
        showToast('Admin account deletion request queued.', 'error');
      }
      setShowDangerModal(false);
      setConfirmInput('');
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setProcessingDanger(false);
    }
  }, [confirmInput, dangerActionType, showToast]);

  return (
    <div className="p-4 sm:p-8 space-y-8 text-slate-100 max-w-7xl mx-auto selection:bg-teal-500 selection:text-slate-950 font-sans transform-gpu">
      
      {/* Toast Feedback Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
                : 'bg-rose-500 text-white shadow-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Settings className="w-6 h-6" />
            </span>
            Admin Control Panel & Clinic Settings
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1 ml-12">
            Instant settings control across account profile, security, branch hours, treatments, medicines, notifications, and billing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-white/10 flex items-center gap-2 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'account', label: '1. Account Details', icon: User },
          { id: 'security', label: '2. Security & 2FA', icon: Shield },
          { id: 'branches', label: '3. Branches & Hours', icon: Building2 },
          { id: 'treatments', label: '4. Treatments & Pricing', icon: Stethoscope },
          { id: 'medicines', label: '5. Medicines & Stock', icon: Pill },
          { id: 'notifications', label: '6. Notifications', icon: Bell },
          { id: 'billing', label: '7. Billing & Plan', icon: CreditCard },
          { id: 'preferences', label: '8. Preferences', icon: Globe },
          { id: 'danger', label: '9. Danger Zone', icon: AlertTriangle, danger: true },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? tab.danger ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                  : tab.danger ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ CONDITIONAL TAB RENDERER (ONLY RENDERS ACTIVE TAB DOM) ═══ */}
      {activeTab === 'account' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-400" /> Administrator Profile & Account Details
                </h2>
                <p className="text-xs text-slate-400">Update your account name, contact email, and primary clinic branch</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-teal-500/20">
                {fullName.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Admin Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Mobile Phone Hotline</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Designation / Role</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Primary Branch</label>
                  <select
                    value={primaryBranch}
                    onChange={(e) => setPrimaryBranch(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Hazara Dental Clinic">Hazara Dental Clinic</option>
                    <option value="Family Dental Clinic">Family Dental Clinic</option>
                    <option value="Both Branches">Both Clinic Branches</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-teal-500/20"
                >
                  {savingAccount ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" /> Admin Security Credentials
              </h2>
              <p className="text-xs text-amber-300 flex items-center gap-1.5 mt-1 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Re-authentication with current password is required before saving password changes.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-md">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Current Admin Password (Re-Auth Required)</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current admin password"
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">New Security Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg shadow-teal-500/20"
              >
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Key className="w-4 h-4" />}
                Re-Authenticate & Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" /> Branch Operational Hours & Camera Setup
              </h2>
              <p className="text-xs text-slate-400">Configure clinic branch working hours, camera passcodes, and capture modes</p>
            </div>

            {loadingBranches ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading branch configurations...</div>
            ) : (
              <div className="space-y-4">
                {branches.map((b) => (
                  <div key={b.id} className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-400" />
                        <div>
                          <h3 className="font-bold text-white text-sm">{b.name}</h3>
                          <span className="text-[11px] text-slate-400 font-mono">Slug: {b.slug}</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                        Hours: {b.operating_hours || '10:00 AM - 08:00 PM'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'treatments' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-400" /> Treatments & Standard Pricing Catalog
              </h2>
              <p className="text-xs text-slate-400">Configure clinic dental procedures, consultation fees, and cost margins</p>
            </div>

            {loadingTreatments ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading treatment catalog...</div>
            ) : (
              <div className="space-y-3">
                {treatments.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <h3 className="font-bold text-white">{t.name}</h3>
                      <span className="text-slate-400 text-[11px]">Base Cost: ₹{t.cost_price || 0}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-teal-400 text-sm">₹{t.price || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'medicines' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-400" /> Medicine Stock & Barcode Inventory
              </h2>
              <p className="text-xs text-slate-400">Manage pharmaceutical inventory, barcode scanning, and patch pricing</p>
            </div>

            {loadingMeds ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading medicines inventory...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {medicines.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <h3 className="font-bold text-white">{m.name}</h3>
                      <span className="text-slate-400 text-[11px]">Generic: {m.generic_name || 'N/A'} • Barcode: {m.barcode || 'N/A'}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-teal-400 text-xs block">Stock: {m.stock || 0} Units</span>
                      <span className="text-[10px] text-slate-400">₹{m.unitPrice || 0} / Patch</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-400" /> Notification Preferences & WhatsApp Gateway
              </h2>
              <p className="text-xs text-slate-400">Controls for automated SMS, WhatsApp broadcasts, and appointment reminder triggers</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                <h3 className="font-bold text-white">WhatsApp & Email Dispatch Policy</h3>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-teal-400 w-4 h-4 rounded" />
                    <span>Email Dispatch Alerts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input type="checkbox" defaultChecked className="accent-teal-400 w-4 h-4 rounded" />
                    <span>WhatsApp Gateway</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-400" /> Subscription Plan & Invoicing
                </h2>
                <p className="text-xs text-slate-400">Manage clinic plan tier, payment methods, and billing contact</p>
              </div>

              <Link
                href="/admin/billing"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Full Billing Center</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Active License</span>
                <h3 className="text-xl font-bold text-white">Pro Dental Enterprise</h3>
                <p className="text-xs text-teal-400 font-medium">₹0.00 / Lifetime Free License</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Billing Contact</span>
                <p className="text-sm font-bold text-white">admin@dentalclinic.in</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" /> Regional & System Preferences
              </h2>
              <p className="text-xs text-slate-400">Configure clinic language, timezone, date display format, and UI theme</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="ur">Urdu (اردو)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Date Display Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 06/09/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/06/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-06)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/30 border border-rose-500/40 shadow-2xl space-y-6">
            <div className="border-b border-rose-500/30 pb-4">
              <h2 className="text-lg font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-400" /> Danger Zone (Destructive Actions)
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-xs">Reset All Clinic Settings to Default</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Restores notification rules and language preferences.</p>
                </div>
                <button
                  onClick={() => {
                    setDangerActionType('reset');
                    setShowDangerModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold hover:bg-rose-500/30"
                >
                  Reset Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Step Modal */}
      <AnimatePresence>
        {showDangerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-rose-500/30 pb-3">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
                <h3 className="text-base font-bold text-white">Confirm Destructive Action</h3>
              </div>

              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type RESET"
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDangerModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteDangerAction}
                  disabled={processingDanger}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Confirm Execution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
