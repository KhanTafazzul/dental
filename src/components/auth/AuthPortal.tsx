"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Phone,
  KeyRound,
  Check,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Award,
} from "lucide-react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
} from "@/lib/firebase";
import { sendWahaOtpAction, verifyWahaOtpAction } from "@/actions/otp.actions";
import Link from "next/link";
import DentalLogo from "@/components/DentalLogo";
import DpdpModal from "@/components/DpdpModal";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { AuthSkeleton } from "@/components/skeletons/AuthSkeleton";

function AuthPortalForm({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // WhatsApp OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [otpStatusMsg, setOtpStatusMsg] = useState<string | null>(null);

  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [showDpdpModal, setShowDpdpModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("falix_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const savePatientSession = (userEmail: string, name?: string, uid?: string, photoURL?: string, verifiedMobile?: string) => {
    if (typeof window === "undefined") return;
    const sessionObj = {
      email: userEmail.trim().toLowerCase(),
      fullName: name || fullName || userEmail.split("@")[0],
      uid: uid || "user_" + Date.now(),
      mobile: verifiedMobile || mobile || "",
      avatarUrl: photoURL || "",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem("falix_patient_user", JSON.stringify(sessionObj));
    window.dispatchEvent(new Event("falix_auth_changed"));
  };

  const handleSendOtp = async () => {
    if (!mobile.trim() || mobile.trim().replace(/\D/g, "").length < 8) {
      setError("Please enter a valid WhatsApp mobile number before requesting an OTP code.");
      return;
    }
    setSendingOtp(true);
    setError(null);
    setOtpStatusMsg(null);
    try {
      const res = await sendWahaOtpAction(mobile);
      if (res.success) {
        setOtpSent(true);
        setOtpStatusMsg(res.message || "Verification code dispatched via WhatsApp.");
      } else {
        setError(res.error || "Failed to transmit OTP via WhatsApp gateway.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while dispatching verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code received on WhatsApp.");
      return;
    }
    const targetMobile = mobile.trim();
    setVerifyingOtp(true);
    setError(null);
    try {
      const res = await verifyWahaOtpAction(targetMobile, otpInput);
      if (res.success) {
        if (mobile.trim() === targetMobile) {
          setOtpVerified(true);
          setVerifiedPhone(targetMobile);
          setOtpStatusMsg("Mobile number verified successfully via WhatsApp.");
        }
      } else {
        setError(res.error || "Invalid or expired WhatsApp OTP code.");
      }
    } catch (err: any) {
      setError(err.message || "Verification process failed. Please check network.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email) {
          setError("Please specify the registered email address for credential recovery.");
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccessMsg("Security recovery dispatch successful. Please inspect your inbox for verification instructions.");
        setLoading(false);
        return;
      }

      if (mode === "register") {
        if (!fullName.trim()) {
          setError("Clinical documentation standards mandate providing a full legal name.");
          setLoading(false);
          return;
        }
        if (!mobile.trim() || mobile.trim().length < 8) {
          setError("A contact telephone is required for appointment confirmations.");
          setLoading(false);
          return;
        }
        if (!otpVerified || verifiedPhone !== mobile.trim()) {
          setError("WhatsApp mobile verification is required to establish patient communications.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Security mismatch: Passwords do not correlate.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Security vulnerability: Passwords must exceed 6 cryptographic characters.");
          setLoading(false);
          return;
        }
        if (!dpdpConsent) {
          setError("Compliance requirement: Please accept the statutory DPDP Act 2023 consent disclosure.");
          setLoading(false);
          return;
        }

        const userCredential = await registerWithEmail(email, password);
        savePatientSession(email, fullName, userCredential?.user?.uid, undefined, mobile.trim());

        if (rememberMe && typeof window !== "undefined") {
          localStorage.setItem("falix_remembered_email", email.trim());
        }

        setSuccessMsg("Patient record provisioned successfully. Transitioning to clinical portal...");
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get("redirect") || "/account";
          window.location.href = redirectUrl;
        }, 1200);
      } else {
        const userCredential = await loginWithEmail(email, password);
        savePatientSession(
          email,
          userCredential?.user?.displayName || undefined,
          userCredential?.user?.uid,
          userCredential?.user?.photoURL || undefined
        );

        if (rememberMe && typeof window !== "undefined") {
          localStorage.setItem("falix_remembered_email", email.trim());
        } else if (typeof window !== "undefined") {
          localStorage.removeItem("falix_remembered_email");
        }

        setSuccessMsg("Clinical authentication confirmed. Access granted.");
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get("redirect") || "/account";
          window.location.href = redirectUrl;
        }, 1000);
      }
    } catch (err: any) {
      let friendlyError = "Authentication failed. Please verify credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        friendlyError = "Invalid clinical credentials. Please verify your email and password.";
      } else if (err.code === "auth/user-not-found") {
        friendlyError = "No clinical account found with this email. Please create a new account.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyError = "An account already exists with this email address. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "Password should be at least 6 characters.";
      } else if (err.message) {
        friendlyError = err.message;
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      if (mode === "register" && !dpdpConsent) {
        setError("Compliance requirement: Please accept the DPDP Act 2023 consent disclosure before proceeding.");
        setGoogleLoading(false);
        return;
      }

      const userCredential = await loginWithGoogle();
      if (userCredential?.user) {
        const user = userCredential.user;
        savePatientSession(
          user.email || "",
          user.displayName || undefined,
          user.uid,
          user.photoURL || undefined
        );
        setSuccessMsg("Google authorization confirmed. Transitioning to clinical portal...");
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get("redirect") || "/account";
          window.location.href = redirectUrl;
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Google single sign-on failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FDFBF7] dark:bg-[#0F150D] text-[#2C3325] dark:text-[#F5F7F3] font-ui transition-colors overflow-x-hidden">
      
      {/* Left Branding Showcase (Visible on Desktop / Heroic Banner on Mobile) */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#2C3325] via-[#36422E] to-[#1C2618] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#4A5D23]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#88B04B]/20 blur-3xl pointer-events-none" />
        
        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Go to homepage">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition">
              <DentalLogo size={32} />
            </div>
            <div>
              <span className="text-lg font-bold font-display tracking-tight text-white block">Hazara & Family Dental</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A3B799]">Advanced Oral Healthcare</span>
            </div>
          </Link>
        </div>

        {/* Hero Visual Middle */}
        <div className="my-8 lg:my-0 relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A5D23]/40 border border-[#88B04B]/30 text-xs font-semibold text-[#E4E7D3]">
              <Sparkles className="w-3.5 h-3.5 text-[#88B04B]" />
              Painless Modern Dentistry
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-tight text-white">
              Caring for every smile in your family.
            </h1>
            <p className="text-sm text-[#E4E7D3]/80 leading-relaxed max-w-md">
              Secure access to your treatment records, digital prescriptions, upcoming consultation dates, and family oral health profiles.
            </p>
          </motion.div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white font-display font-bold text-lg">
                <HeartHandshake className="w-4 h-4 text-[#88B04B]" /> 12,000+
              </div>
              <div className="text-[11px] text-[#E4E7D3]/70">Satisfied Patients Treated</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white font-display font-bold text-lg">
                <Award className="w-4 h-4 text-[#88B04B]" /> 256-Bit
              </div>
              <div className="text-[11px] text-[#E4E7D3]/70">DPDP Encrypted Records</div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#E4E7D3]/60">
          <span>Official Patient Portal</span>
          <span className="font-mono">DPDP ACT 2023 COMPLIANT</span>
        </div>
      </div>

      {/* Right Column: Interactive Modern Form Container */}
      <div className="lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl space-y-6"
        >
          {/* Top Mode Navigation Tabs */}
          {mode !== "forgot" ? (
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F0F2EB] dark:bg-[#1C2618] border border-[#4A5D23]/15">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }}
                className={`py-3 text-xs sm:text-sm font-bold font-display rounded-xl transition-all cursor-pointer relative ${
                  mode === "login"
                    ? "bg-[#4A5D23] text-white shadow-md shadow-[#4A5D23]/25"
                    : "text-[#556B4B] dark:text-[#A3B799] hover:text-[#2C3325]"
                }`}
              >
                Sign In to Account
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); setSuccessMsg(null); }}
                className={`py-3 text-xs sm:text-sm font-bold font-display rounded-xl transition-all cursor-pointer relative ${
                  mode === "register"
                    ? "bg-[#4A5D23] text-white shadow-md shadow-[#4A5D23]/25"
                    : "text-[#556B4B] dark:text-[#A3B799] hover:text-[#2C3325]"
                }`}
              >
                Create New Account
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4A5D23] hover:text-[#2C3325] dark:text-[#88B04B] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Return to Sign In
            </button>
          )}

          {/* Form Header Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#2C3325] dark:text-white">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Patient Registration" : "Account Recovery"}
            </h2>
            <p className="text-xs sm:text-sm text-[#556B4B] dark:text-[#A3B799] mt-1">
              {mode === "login"
                ? "Enter your registered credentials or sign in with WhatsApp OTP."
                : mode === "register"
                ? "Establish your patient record for seamless appointments and digital prescriptions."
                : "Enter your registered email address to receive password reset instructions."}
            </p>
          </div>

          {/* Status Banners */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC] block">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#556B4B]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aman Khan"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl premium-input text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number + WhatsApp OTP for Registration */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC]">
                    WhatsApp Mobile Number
                  </label>
                  {otpVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Verified via WhatsApp
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !mobile.trim()}
                      className="text-[10px] font-bold text-[#4A5D23] bg-[#E4E7D3] hover:bg-[#4A5D23] hover:text-white px-2.5 py-1 rounded-lg transition border border-[#4A5D23]/20 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {sendingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                      Send WhatsApp OTP
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#556B4B]" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      setOtpVerified(false);
                      setVerifiedPhone(null);
                      setOtpSent(false);
                      setOtpStatusMsg(null);
                    }}
                    placeholder="e.g. 9820012345"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl premium-input text-xs sm:text-sm font-mono font-medium"
                  />
                </div>

                {/* OTP Verification Box */}
                {otpSent && !otpVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3.5 bg-[#E4E7D3]/60 dark:bg-[#182622] border border-[#4A5D23]/30 rounded-2xl space-y-2.5 mt-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#4A5D23] dark:text-teal-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" /> 6-Digit WhatsApp Code sent to {mobile}
                      </span>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="text-[10px] font-semibold text-[#556B4B] hover:text-[#4A5D23] underline cursor-pointer disabled:opacity-50"
                      >
                        {sendingOtp ? "Sending..." : "Resend"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 482910"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#121c19] border border-[#4A5D23]/30 rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D23]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpInput.length < 6}
                        className="px-4 py-2 bg-[#4A5D23] hover:bg-[#3D4C1D] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
                      >
                        {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Verify Code
                      </button>
                    </div>
                    {otpStatusMsg && <p className="text-[10px] text-[#4A5D23] dark:text-teal-300">{otpStatusMsg}</p>}
                  </motion.div>
                )}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC] block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#556B4B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl premium-input text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC]">
                    Confidential Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(null); }}
                      className="text-xs font-medium text-[#4A5D23] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#556B4B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl premium-input text-xs sm:text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#556B4B] hover:text-[#2C3325] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password for Register */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C3325] dark:text-[#E2E8DC] block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#556B4B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl premium-input text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* DPDP Consent Checkbox for Register */}
            {mode === "register" && (
              <div className="flex items-start gap-2.5 pt-2 text-xs text-[#556B4B] dark:text-[#A3B799]">
                <input
                  type="checkbox"
                  id="dpdp-consent"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 rounded accent-[#4A5D23] cursor-pointer w-4 h-4 shrink-0"
                />
                <label htmlFor="dpdp-consent" className="leading-relaxed cursor-pointer select-none">
                  I hereby grant statutory consent under the DPDP Act 2023 for clinical record processing pursuant to the{" "}
                  <Link href="/terms" target="_blank" className="underline font-semibold text-[#4A5D23] hover:text-[#2C3325]">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="underline font-semibold text-[#4A5D23] hover:text-[#2C3325]">
                    Privacy Policy
                  </Link>.
                </label>
              </div>
            )}

            {/* Submit Action Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-sm transition-all shadow-md shadow-[#4A5D23]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Sign In to Dental Portal"
                      : mode === "register"
                      ? "Complete Patient Registration"
                      : "Send Recovery Link"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full border-t border-[#4A5D23]/15" />
            <span className="bg-[#FDFBF7] dark:bg-[#0F150D] px-4 text-[11px] font-mono tracking-widest text-[#556B4B] uppercase">
              Or continue with
            </span>
          </div>

          {/* Google Sign-In Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 rounded-2xl border border-[#4A5D23]/20 bg-white dark:bg-[#1C2618] hover:bg-[#F0F2EB] dark:hover:bg-[#2C3A27] text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#4A5D23]" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Single Sign-On</span>
              </>
            )}
          </motion.button>

          {/* Bottom DPDP / Privacy badge */}
          <div className="pt-4 flex items-center justify-center gap-2 text-[11px] text-[#556B4B] dark:text-[#A3B799]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D23]" />
            <span>Encrypted with SHA-256 and certified by Hazara & Family Dental</span>
          </div>
        </motion.div>
      </div>

      <DpdpModal isOpen={showDpdpModal} onClose={() => setShowDpdpModal(false)} />
    </div>
  );
}

export default function AuthPortal({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  return (
    <ProgressiveLoader skeleton={<AuthSkeleton />}>
      <AuthPortalForm initialMode={initialMode} />
    </ProgressiveLoader>
  );
}