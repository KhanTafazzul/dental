'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X, HeartHandshake, CheckCircle2, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { deletePatientAccount } from '@/app/admin/actions';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientEmail?: string;
}

export default function DeleteAccountModal({ isOpen, onClose, patientEmail = '' }: DeleteAccountModalProps) {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [confirmStep, setConfirmStep] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleted, setDeleted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const feedbackReasons = [
    'My dental treatment is completed',
    'I moved to a new location or city',
    'Privacy or data retention preferences',
    'Created a duplicate account',
    'Other reason'
  ];

  const handleProceedToDelete = async () => {
    if (!patientEmail) {
      setErrorMsg('No active patient session found to delete.');
      return;
    }
    setDeleting(true);
    setErrorMsg(null);

    const finalReason = reason === 'Other reason' ? customReason : reason;

    try {
      await deletePatientAccount(patientEmail, finalReason);
      
      // Clear patient session locally
      if (typeof window !== 'undefined') {
        localStorage.removeItem('falix_patient_user');
        window.dispatchEvent(new Event('falix_auth_changed'));
      }
      setDeleted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Close Header Button */}
          {!deleted && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* ═══ DELETED CONFIRMATION SCREEN ═══ */}
          {deleted ? (
            <div className="text-center py-6 space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-teal-500/15 border border-teal-500/30 rounded-2xl flex items-center justify-center text-teal-400 mx-auto">
                <HeartHandshake className="w-9 h-9" />
              </div>

              <h2 className="text-2xl font-serif font-bold text-white">Account Closed Successfully</h2>

              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your patient account credentials have been permanently deleted. Thank you for trusting Dental Care Network with your health. We wish you good health and a bright smile! You are always welcome back.
              </p>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/';
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Return to Clinic Homepage
                </button>
              </div>
            </div>
          ) : !confirmStep ? (
            /* ═══ STEP 1: EXPLAIN CONSEQUENCES & OPTIONAL FEEDBACK ═══ */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Delete Patient Account</h2>
                  <p className="text-xs text-rose-400 font-medium">Under DPDP Act 2023 (Right to Erasure)</p>
                </div>
              </div>

              {/* Consequence Explanation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 text-xs text-slate-300">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  What happens when you delete your account?
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px] leading-relaxed">
                  <li>Your login credentials and account profile will be <strong className="text-white">permanently erased immediately</strong>.</li>
                  <li>Any active online appointment bookings under <span className="text-teal-400 font-mono">{patientEmail}</span> will be cancelled.</li>
                  <li>Past medical & prescription records are archived securely in accordance with Indian Council of Medical Research statutory guidelines.</li>
                  <li>Deletion is permanent, but you are free to create a new account whenever you need dental care.</li>
                </ul>
              </div>

              {/* Respectful Feedback Survey (Optional) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Help Us Improve (Optional Feedback)
                </label>
                <p className="text-[11px] text-slate-400">
                  If you feel comfortable sharing, why are you closing your account today?
                </p>

                <div className="space-y-1.5">
                  {feedbackReasons.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        reason === r
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-200'
                          : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delete-reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-teal-500 focus:ring-teal-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                {reason === 'Other reason' && (
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tell us any additional feedback..."
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 mt-2"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Keep My Account
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmStep(true)}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  Continue to Delete <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ═══ STEP 2: FINAL CONFIRMATION BUTTON ═══ */
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-1">Confirm Account Deletion</h2>
                <p className="text-xs text-slate-300">
                  Are you sure you want to permanently delete the patient account for <span className="text-teal-300 font-bold font-mono">{patientEmail}</span>?
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs text-slate-400 text-left">
                <span className="font-bold text-white block mb-1">Final Summary:</span>
                This action will immediately log you out and delete your credentials. Active appointment bookings under this email will be removed.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirmStep(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleProceedToDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Permanently Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Badge */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              DPDP Act 2023 Compliant Erasure
            </span>
            <span className="text-[10px] text-slate-400">Immediate Action</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
