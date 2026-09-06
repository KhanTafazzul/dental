'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type Variants, type Transition } from 'framer-motion';
import { 
  Lock, Mail, User, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck, 
  Activity, CheckCircle2, AlertCircle, Loader2, Stethoscope, ChevronLeft,
  Star, Heart, BookOpen, Check, Users, Gift
} from 'lucide-react';
import { 
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword
} from '@/lib/firebase';
import Link from 'next/link';
import DentalLogo from '@/components/DentalLogo';
import DpdpModal from '@/components/DpdpModal';

export default function AuthPortal({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // DPDP Consent state & modal
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [showDpdpModal, setShowDpdpModal] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);
  const shineOpacity = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.15, 0.35]), springConfig);

  const savePatientSession = (userEmail: string, name?: string, uid?: string) => {
    if (typeof window === 'undefined') return;
    const sessionObj = {
      email: userEmail.trim().toLowerCase(),
      fullName: name || fullName || userEmail.split('@')[0],
      uid: uid || 'user_' + Date.now(),
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('falix_patient_user', JSON.stringify(sessionObj));
    window.dispatchEvent(new Event('falix_auth_changed'));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Password Requirements Checker (Wrapped in useMemo)
  const passRequirements = React.useMemo(() => ({
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (passRequirements.length) score += 1;
    if (pass.length >= 10) score += 1;
    if (passRequirements.uppercase) score += 1;
    if (passRequirements.number) score += 1;
    if (passRequirements.symbol) score += 1;
    return Math.min(score, 4);
  };

  const strength = calculatePasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Ultra Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-400'];

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeTrigger(prev => prev + 1);
    setSuccessMsg(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      if (!email) return triggerError('Please enter your registered email address.');
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset link dispatched to your email.');
      } else {
        triggerError(res.error || 'Failed to send reset link.');
      }
      return;
    }

    if (!email || !password) {
      return triggerError('Please fill in all required credentials.');
    }

    if (!dpdpConsent) {
      return triggerError('Please accept the DPDP Act 2023 consent to proceed.');
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        return triggerError('Passwords do not match.');
      }
      if (password.length < 6) {
        return triggerError('Password must be at least 6 characters long.');
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await loginWithEmail(email, password);
        if (res.error) {
          triggerError(res.error);
        } else {
          savePatientSession(email, fullName, res.user?.uid);
          setSuccessMsg('Welcome back! Redirecting to clinic portal...');
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || '/';
            window.location.href = redirectUrl;
          }, 1000);
        }
      } else {
        const res = await registerWithEmail(email, password);
        if (res.error) {
          triggerError(res.error);
        } else {
          savePatientSession(email, fullName, res.user?.uid);
          setSuccessMsg('Account created successfully! Preparing your clinic portal...');
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || '/';
            window.location.href = redirectUrl;
          }, 1000);
        }
      }
    } catch (err: any) {
      triggerError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!dpdpConsent) {
      return triggerError('Please accept the DPDP Act 2023 consent to proceed with Google Sign-In.');
    }
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.error) {
        triggerError(res.error);
      } else {
        savePatientSession(res.user?.email || email, res.user?.displayName || fullName, res.user?.uid);
        setSuccessMsg('Authenticated via Google! Redirecting...');
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect') || '/';
          window.location.href = redirectUrl;
        }, 1000);
      }
    } catch (err: any) {
      triggerError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950/40 to-slate-950 selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Ambient Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-teal-500/15 blur-[120px] will-change-transform"
        />
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-cyan-500/15 blur-[140px] will-change-transform"
        />
      </div>

      <div className="w-full max-w-5xl z-10 my-6">
        
        {/* Main 2-Column Responsive Card Grid */}
        <div style={{ perspective: 1200 }}>
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            <motion.div 
              style={{ opacity: shineOpacity }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/[0.08] to-teal-400/[0.1] pointer-events-none"
            />

            {/* ═══ LEFT COLUMN: AUTH FORM ═══ */}
            <div className="lg:col-span-7 p-7 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
              
              <div>
                {/* Header Logo & Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="inline-flex items-center gap-3">
                    <DentalLogo iconOnly={false} size={38} />
                  </Link>

                  <Link
                    href="/"
                    className="text-xs font-semibold text-slate-400 hover:text-teal-300 transition-colors py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/10"
                  >
                    Home
                  </Link>
                </div>

                {/* Mode Selector Tabs */}
                {mode !== 'forgot' ? (
                  <div className="relative p-1 mb-6 rounded-2xl bg-slate-950/70 border border-white/[0.08] flex items-center">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                      className={
                        mode === 'login'
                          ? 'relative flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-colors z-10'
                          : 'relative flex-1 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200 transition-colors z-10'
                      }
                    >
                      {mode === 'login' && (
                        <motion.div
                          layoutId="activeTabPill"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 shadow-[0_0_20px_rgba(20,184,166,0.35)] -z-10"
                        />
                      )}
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                      className={
                        mode === 'register'
                          ? 'relative flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-colors z-10'
                          : 'relative flex-1 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200 transition-colors z-10'
                      }
                    >
                      {mode === 'register' && (
                        <motion.div
                          layoutId="activeTabPill"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 shadow-[0_0_20px_rgba(20,184,166,0.35)] -z-10"
                        />
                      )}
                      Create Account
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(null); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-teal-500/10"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Sign In
                    </button>
                  </div>
                )}

                {/* Checklist Requirement 2 & 3: Title & Description */}
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mb-1.5">
                    {mode === 'register' && 'Create Your Free Patient Account'}
                    {mode === 'login' && 'Sign In to Patient Portal'}
                    {mode === 'forgot' && 'Reset Your Account Password'}
                  </h1>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mode === 'register' && 'Register in 60 seconds to book zero-cost appointments at Hazara & Family Dental Clinics, access diagnostic reports, and manage your oral health.'}
                    {mode === 'login' && 'Welcome back! Access your appointment schedule, doctor diagnosis reports, and clinic history.'}
                    {mode === 'forgot' && 'Enter your registered email address below to receive an instant password recovery link.'}
                  </p>
                </div>

                {/* Checklist Requirement 11: Free Account Guarantee Badge */}
                {mode === 'register' && (
                  <div className="mb-5 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="font-semibold">100% Free Lifetime Account • Zero Upfront Money Required • Free Booking</span>
                  </div>
                )}

                {/* Alert Notifications */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="err-banner"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0, x: shakeTrigger ? [-8, 8, -6, 6, -3, 3, 0] : 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      key="succ-banner"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-5 p-3.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-xs flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Fields */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-200">
                          Full Name
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal">Patient Name</span>
                      </div>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Priya Sharma"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 font-light">
                        Hint: Enter your legal name as it should appear on prescriptions and clinic records.
                      </p>
                    </div>
                  )}

                  {/* Checklist Requirement 4: Account Identification */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-200">
                        Email Address
                      </label>
                      <span className="text-[10px] text-teal-400 font-semibold">Unique Account ID</span>
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                      <input
                        type="email"
                        required
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. patient@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 font-light">
                      Hint: Used as your primary login ID and for receiving direct doctor notifications.
                    </p>
                  </div>

                  {/* Checklist Requirement 5: Setting a Password & Requirements */}
                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-200">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => { setMode('forgot'); setError(null); }}
                            className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="e.g. SafePass@2026"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all"
                        />
                        {/* Toggle Password Visibility */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Hide password" : "Make password visible"}
                          className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 font-light">
                        Hint: Create a secure passcode to protect your personal medical data.
                      </p>

                      {/* Password Strength Bar & Requirement Checklist */}
                      {mode === 'register' && password.length > 0 && (
                        <div className="mt-2.5 space-y-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/10">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Password Strength:</span>
                            <span className="font-bold text-teal-300">{strengthLabels[strength]}</span>
                          </div>

                          <div className="flex gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            {[0, 1, 2, 3].map((lvl) => (
                              <div
                                key={lvl}
                                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                  strength >= lvl + 1 ? strengthColors[strength] : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Specific Password Requirements */}
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-white/5">
                            <span className={`flex items-center gap-1 ${passRequirements.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <Check className="w-3 h-3" /> Min 6 Characters
                            </span>
                            <span className={`flex items-center gap-1 ${passRequirements.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <Check className="w-3 h-3" /> Uppercase (A-Z)
                            </span>
                            <span className={`flex items-center gap-1 ${passRequirements.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <Check className="w-3 h-3" /> Number (0-9)
                            </span>
                            <span className={`flex items-center gap-1 ${passRequirements.symbol ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <Check className="w-3 h-3" /> Symbol (!@#$)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter passcode"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 font-light">
                        Hint: Ensure both password fields match exactly.
                      </p>
                    </div>
                  )}

                  {/* DPDP Act 2023 Consent Checkbox */}
                  {mode !== 'forgot' && (
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="dpdp-auth-consent-cb"
                        checked={dpdpConsent}
                        onChange={(e) => setDpdpConsent(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-slate-950 text-teal-500 focus:ring-teal-500/50 cursor-pointer"
                      />
                      <label htmlFor="dpdp-auth-consent-cb" className="text-[11px] leading-tight text-slate-300">
                        I consent to the collection & processing of my data under the{' '}
                        <button
                          type="button"
                          onClick={() => setShowDpdpModal(true)}
                          className="text-teal-400 font-semibold underline hover:text-teal-300"
                        >
                          DPDP Act 2023 & Rules 2025
                        </button>.
                      </label>
                    </div>
                  )}

                  <button
                    disabled={loading || googleLoading}
                    type="submit"
                    className="w-full relative py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 hover:opacity-95 shadow-lg shadow-teal-500/25 border border-teal-300/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Processing Account...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === 'login' && 'Sign In to Portal'}
                          {mode === 'register' && 'Create Free Account'}
                          {mode === 'forgot' && 'Send Reset Link'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Checklist Requirement 7: Third Party Google Sign Up */}
                {mode !== 'forgot' && (
                  <>
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-slate-900 text-slate-400 font-semibold text-[10px] uppercase tracking-widest">
                          Or sign up with
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading || googleLoading}
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-3 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                          <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8 0-1 .1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                        </svg>
                      )}
                      <span>Continue with Google Account</span>
                    </button>
                  </>
                )}

                {/* Checklist Requirement 6: Link to Login / Mode switch prompt */}
                <div className="mt-5 text-center text-xs text-slate-400">
                  {mode === 'register' ? (
                    <p>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); }}
                        className="text-teal-400 font-bold underline hover:text-teal-300"
                      >
                        Sign In here
                      </button>
                    </p>
                  ) : (
                    <p>
                      New patient?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(null); }}
                        className="text-teal-400 font-bold underline hover:text-teal-300"
                      >
                        Create your free account
                      </button>
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Practitioner Link */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-400">
                  Are you a clinic practitioner?{' '}
                  <Link href="/admin/login" className="text-teal-400 hover:underline font-semibold">
                    Access Admin Console
                  </Link>
                </p>
              </div>

            </div>

            {/* ═══ RIGHT COLUMN: SOCIAL PROOF, CUSTOMER COUNT, TESTIMONIAL, BLOG SPOTLIGHT ═══ */}
            <div className="lg:col-span-5 p-7 sm:p-10 bg-slate-950/60 flex flex-col justify-between space-y-6">
              
              {/* Checklist Requirement 8: Current Active Customer Count */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                  <Users className="w-4 h-4" />
                  <span>Trusted Community</span>
                </div>
                <div className="text-3xl font-serif font-extrabold text-white">
                  14,800+
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Happy patients served across Hazara Dental Store & Family Dental Store clinics.
                </p>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-slate-300 text-[11px] ml-1.5">4.9/5 from 2,400+ reviews</span>
                </div>
              </div>

              {/* Checklist Requirement 9: Testimonial or Social Proof */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-500/20 space-y-3">
                <div className="flex items-center gap-1 text-teal-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Patient Testimonial</span>
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  &quot;Booking my dental checkup took less than a minute. No money required upfront, and the doctor emailed my diagnosis right after my visit!&quot;
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="font-bold text-white">— Priya Sharma</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Patient
                  </span>
                </div>
              </div>

              {/* Checklist Requirement 10: Blog Post Spotlight */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>Dental Health Insights</span>
                </div>
                <h4 className="text-xs font-bold text-white">5 Preventive Habits for Strong Enamel</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Routine 6-month checkups prevent 90% of severe dental erosion. Read our latest advice on fluoride care.
                </p>
                <Link
                  href="/dpdp"
                  className="text-[11px] font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 pt-1"
                >
                  Read Blog Article <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Safeguard Badges */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> DPDP Act 2023
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL
                </span>
              </div>

            </div>

          </motion.div>
        </div>
      </div>

      {/* DPDP Compliance Modal */}
      <DpdpModal isOpen={showDpdpModal} onClose={() => setShowDpdpModal(false)} />
    </div>
  );
}