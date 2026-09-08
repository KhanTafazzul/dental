'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Lock, Mail, User, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck, 
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, Gift, Check
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
  const [rememberMe, setRememberMe] = useState(true);
  const [showDpdpModal, setShowDpdpModal] = useState(false);

  // Pre-fill email if remembered from previous session
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('falix_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

  const savePatientSession = (userEmail: string, name?: string, uid?: string, photoURL?: string) => {
    if (typeof window === 'undefined') return;
    const sessionObj = {
      email: userEmail.trim().toLowerCase(),
      fullName: name || fullName || userEmail.split('@')[0],
      uid: uid || 'user_' + Date.now(),
      avatarUrl: photoURL || '',
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

  // Password Requirements Checker
  const passRequirements = React.useMemo(() => ({
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const strength = React.useMemo(() => {
    let score = 0;
    if (passRequirements.length) score += 1;
    if (password.length >= 10) score += 1;
    if (passRequirements.uppercase) score += 1;
    if (passRequirements.number) score += 1;
    if (passRequirements.symbol) score += 1;
    return Math.min(score, 4);
  }, [password, passRequirements]);

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-400', 'bg-cyan-400'];

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeTrigger(prev => prev + 1);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      triggerError('Please enter your email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        const res = await resetPassword(email);
        if (res.error) triggerError(res.error);
        else setSuccessMsg('Password recovery email sent! Check your inbox.');
      } catch (err: any) {
        triggerError(err.message || 'Failed to send recovery email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      triggerError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        triggerError('Please enter your full legal name.');
        return;
      }
      if (password !== confirmPassword) {
        triggerError('Passwords do not match. Please check again.');
        return;
      }
      if (!passRequirements.length) {
        triggerError('Password must be at least 6 characters long.');
        return;
      }
      if (!dpdpConsent) {
        triggerError('Please accept the DPDP Act 2023 consent to create an account.');
        return;
      }

      setLoading(true);
      try {
        const res = await registerWithEmail(email, password, fullName);
        if (res.error) {
          triggerError(res.error);
        } else {
          savePatientSession(res.user?.email || email, fullName, res.user?.uid);
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || '/';
            window.location.href = redirectUrl;
          }, 1000);
        }
      } catch (err: any) {
        triggerError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await loginWithEmail(email, password);
        if (res.error) {
          triggerError(res.error);
        } else {
          if (rememberMe) {
            localStorage.setItem('falix_remembered_email', email);
          } else {
            localStorage.removeItem('falix_remembered_email');
          }
          savePatientSession(res.user?.email || email, res.user?.displayName || '', res.user?.uid);
          setSuccessMsg('Successfully signed in! Redirecting...');
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || '/';
            window.location.href = redirectUrl;
          }, 800);
        }
      } catch (err: any) {
        triggerError(err.message || 'Sign in failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!dpdpConsent) {
      triggerError('Please accept the DPDP Act 2023 consent before signing in.');
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.error) {
        triggerError(res.error);
      } else {
        savePatientSession(res.user?.email || email, res.user?.displayName || fullName, res.user?.uid, res.user?.photoURL || '');
        setSuccessMsg('Authenticated via Google! Redirecting...');
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect') || '/';
          window.location.href = redirectUrl;
        }, 800);
      }
    } catch (err: any) {
      triggerError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-gradient-to-br from-[#06120f] via-[#0b1f1a] to-[#040c0a] selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-[100px] will-change-transform"
        />
        <motion.div 
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-teal-500/15 blur-[120px] will-change-transform"
        />
      </div>

      {/* Centered Compact Auth Card Container (Clean Single-Column Layout) */}
      <div className="w-full max-w-lg z-10 my-4" style={{ perspective: 1200 }}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full rounded-3xl bg-[#0c1a17]/90 backdrop-blur-2xl border border-emerald-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-8 overflow-hidden max-h-[92vh] flex flex-col justify-between"
        >
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            
            {/* Header Logo & Home Navigation */}
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <DentalLogo iconOnly={false} size={34} />
              </Link>
              <Link
                href="/"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                Back to Home
              </Link>
            </div>

            {/* Mode Switch Tabs (Log In vs Create Account) */}
            {mode !== 'forgot' ? (
              <div className="relative p-1 rounded-2xl bg-[#050f0c] border border-emerald-900/40 flex items-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  className={
                    mode === 'login'
                      ? 'relative flex-1 py-2 text-xs font-bold rounded-xl text-white transition-colors z-10 cursor-pointer'
                      : 'relative flex-1 py-2 text-xs font-semibold rounded-xl text-emerald-600 hover:text-emerald-300 transition-colors z-10 cursor-pointer'
                  }
                >
                  {mode === 'login' && (
                    <motion.div
                      layoutId="authActiveTab"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] -z-10"
                    />
                  )}
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                  className={
                    mode === 'register'
                      ? 'relative flex-1 py-2 text-xs font-bold rounded-xl text-white transition-colors z-10 cursor-pointer'
                      : 'relative flex-1 py-2 text-xs font-semibold rounded-xl text-emerald-600 hover:text-emerald-300 transition-colors z-10 cursor-pointer'
                  }
                >
                  {mode === 'register' && (
                    <motion.div
                      layoutId="authActiveTab"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] -z-10"
                    />
                  )}
                  Create Account
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </div>
            )}

            {/* Dynamic Form Header Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                {mode === 'register' && 'Create Your Patient Account'}
                {mode === 'login' && 'Sign In to Patient Portal'}
                {mode === 'forgot' && 'Reset Account Password'}
              </h1>
              <p className="text-xs text-emerald-400/80 mt-1 leading-relaxed">
                {mode === 'register' && 'Register in seconds to manage clinic appointments, view treatment bills, and direct doctor consultations.'}
                {mode === 'login' && 'Welcome back! Access your dental care records and appointment schedules.'}
                {mode === 'forgot' && 'Enter your registered email below to receive a password recovery link.'}
              </p>
            </div>

            {/* Error & Success Alert Banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="err-banner"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0, x: shakeTrigger ? [-6, 6, -4, 4, -2, 2, 0] : 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  key="succ-banner"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Form Fields with Smooth Transition */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'register' ? 15 : -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'register' ? -15 : 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onSubmit={handleEmailAuth}
                className="space-y-3"
              >
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aman Sharma"
                        className="w-full pl-9 pr-3 py-2 bg-[#050f0c] border border-emerald-900/40 rounded-xl text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. patient@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#050f0c] border border-emerald-900/40 rounded-xl text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-200">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setError(null); }}
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-[#050f0c] border border-emerald-900/40 rounded-xl text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-2.5 text-emerald-600 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator for Register */}
                    {mode === 'register' && password.length > 0 && (
                      <div className="mt-2 p-2 rounded-xl bg-[#050f0c] border border-emerald-900/40 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <span>Strength:</span>
                          <span className="font-bold text-emerald-300">{strengthLabels[strength]}</span>
                        </div>
                        <div className="flex gap-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          {[0, 1, 2, 3].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-full flex-1 rounded-full transition-all ${
                                strength >= lvl + 1 ? strengthColors[strength] : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Password field for Register */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3 py-2 bg-[#050f0c] border border-emerald-900/40 rounded-xl text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Checkboxes: Remember Me & DPDP Consent */}
                {mode !== 'forgot' && (
                  <div className="space-y-1.5 pt-1">
                    {mode === 'login' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="remember-me-cb"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-emerald-900/50 bg-[#050f0c] text-emerald-500 focus:ring-emerald-500/40 cursor-pointer"
                        />
                        <label htmlFor="remember-me-cb" className="text-xs text-slate-300 font-medium cursor-pointer">
                          Remember me on this browser
                        </label>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="dpdp-auth-consent-cb"
                        checked={dpdpConsent}
                        onChange={(e) => setDpdpConsent(e.target.checked)}
                        className="mt-0.5 rounded border-emerald-900/50 bg-[#050f0c] text-emerald-500 focus:ring-emerald-500/40 cursor-pointer"
                      />
                      <label htmlFor="dpdp-auth-consent-cb" className="text-[11px] leading-tight text-slate-300">
                        I consent to personal data processing under{' '}
                        <button
                          type="button"
                          onClick={() => setShowDpdpModal(true)}
                          className="text-emerald-400 font-semibold underline hover:text-emerald-300 cursor-pointer"
                        >
                          DPDP Act 2023 Rules
                        </button>.
                      </label>
                    </div>
                  </div>
                )}

                {/* Main Submit Action Button */}
                <button
                  disabled={loading || googleLoading}
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:opacity-95 shadow-md shadow-emerald-500/20 border border-emerald-300/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processing...</span>
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
              </motion.form>
            </AnimatePresence>

            {/* Google SSO Button — Always Visible & Compact */}
            {mode !== 'forgot' && (
              <div className="space-y-3 pt-1 border-t border-emerald-900/30">
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">
                  Or continue with
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-emerald-900/40 text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8 0-1 .1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                    </svg>
                  )}
                  <span>Sign In with Google Account</span>
                </button>
              </div>
            )}

            {/* Mode Switch Footer Prompt */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-emerald-900/20">
              {mode === 'register' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-emerald-400 font-bold underline hover:text-emerald-300 cursor-pointer"
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
                    className="text-emerald-400 font-bold underline hover:text-emerald-300 cursor-pointer"
                  >
                    Create free account
                  </button>
                </p>
              )}
            </div>

            {/* Footer Practitioner Link */}
            <div className="text-center pt-1">
              <p className="text-[11px] text-emerald-600/80">
                Clinic Practitioner?{' '}
                <Link href="/admin/login" className="text-emerald-400 hover:underline font-semibold">
                  Access Admin Console
                </Link>
              </p>
            </div>

          </div>
        </motion.div>
      </div>

      {/* DPDP Compliance Modal */}
      <DpdpModal isOpen={showDpdpModal} onClose={() => setShowDpdpModal(false)} />
    </div>
  );
}