"use client";

import React, { useState, useEffect } from "react";
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
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
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
    if (!mobile.trim() || mobile.trim().length < 8) {
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
    setVerifyingOtp(true);
    setError(null);
    try {
      const res = await verifyWahaOtpAction(mobile, otpInput);
      if (res.success) {
        setOtpVerified(true);
        setOtpStatusMsg("Mobile number successfully verified.");
      } else {
        setError(res.error || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      setError(err.message || "Error validating OTP code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError("Please enter your electronic mail address.");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const res = await resetPassword(email);
        if (res.error) setError(res.error);
        else setSuccessMsg("Password recovery instructions dispatched. Please inspect your email inbox.");
      } catch (err: any) {
        setError(err.message || "Failed to dispatch password recovery email.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError("Please input your confidential security password.");
      return;
    }

    if (mode === "register") {
      if (!fullName.trim()) {
        setError("Please provide your full legal name for medical records.");
        return;
      }
      if (!mobile.trim()) {
        setError("Please provide your mobile number for appointment reminders.");
        return;
      }
      if (!otpVerified) {
        setError("Verification Required: Please verify your mobile number via the 6-digit WhatsApp OTP code prior to account registration.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Security passwords do not match. Please verify both entries.");
        return;
      }
      if (password.length < 6) {
        setError("Security password must be at least six (6) characters in length.");
        return;
      }
      if (!dpdpConsent) {
        setError("Compliance requirement: Please accept the statutory DPDP Act 2023 consent disclosure.");
        return;
      }

      setLoading(true);
      try {
        const res = await registerWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          savePatientSession(res.user?.email || email, fullName, res.user?.uid, undefined, mobile);
          setSuccessMsg("Patient account registered successfully. Transitioning to clinical portal...");
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "/account";
            window.location.href = redirectUrl;
          }, 800);
        }
      } catch (err: any) {
        setError(err.message || "Patient registration failed.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await loginWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          if (rememberMe) {
            localStorage.setItem("falix_remembered_email", email);
          } else {
            localStorage.removeItem("falix_remembered_email");
          }
          savePatientSession(res.user?.email || email, res.user?.displayName || "", res.user?.uid);
          setSuccessMsg("Authentication verified. Loading patient dashboard...");
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "/account";
            window.location.href = redirectUrl;
          }, 800);
        }
      } catch (err: any) {
        setError(err.message || "Authentication credentials invalid.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!dpdpConsent) {
      setError("Please acknowledge the DPDP Act 2023 data consent notice before proceeding.");
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.error) {
        setError(res.error);
      } else {
        savePatientSession(res.user?.email || email, res.user?.displayName || fullName, res.user?.uid, res.user?.photoURL || "");
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center p-4 sm:p-6 bg-[#F5F7F3] dark:bg-[#0F150D] blueprint-grid transition-colors">
      <AppleLiquidCard variant="light" className="w-full max-w-lg p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Go to homepage">
            <DentalLogo size={34} />
            <span className="text-sm font-bold font-serif text-[#1C2618] dark:text-[#F5F7F3]">Hazara & Family Dental</span>
          </Link>
          <TelemetryBadge label="Secure Clinical Portal" code="256-BIT" variant="sage" />
        </div>

        {/* Mode Switch Tabs */}
        {mode !== "forgot" ? (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#E2E8DC]/80 dark:bg-[#2C3A27]/60 border border-[#A3B799]/30">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#2C3A27] text-[#F5F7F3] shadow-md"
                  : "text-[#556B4B] dark:text-[#A3B799] hover:text-[#1C2618]"
              }`}
            >
              Patient Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#2C3A27] text-[#F5F7F3] shadow-md"
                  : "text-[#556B4B] dark:text-[#A3B799] hover:text-[#1C2618]"
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <button
            onClick={() => setMode("login")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#556B4B] hover:text-[#2C3A27] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Patient Sign In
          </button>
        )}

        {/* Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aman Khan"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>
            </div>
          )}

          {/* Registration Mode: Mobile + WhatsApp OTP Verification */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">WhatsApp Mobile Number</label>
                {otpVerified ? (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Verified via WhatsApp
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !mobile.trim()}
                    className="text-[10px] font-bold text-[#4A5D23] bg-[#E4E7D3] hover:bg-[#4A5D23] hover:text-white px-2.5 py-0.5 rounded-lg transition border border-[#4A5D23]/20 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {sendingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                    Send WhatsApp OTP
                  </button>
                )}
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setOtpVerified(false);
                    setOtpSent(false);
                  }}
                  placeholder="e.g. 9820012345"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>

              {/* OTP Input Section */}
              {otpSent && !otpVerified && (
                <div className="p-3 bg-[#E4E7D3]/40 dark:bg-[#182622] border border-[#4A5D23]/30 rounded-xl space-y-2 mt-2">
                  <span className="text-[11px] font-bold text-[#4A5D23] dark:text-teal-300 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Enter 6-Digit WhatsApp Code
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#121c19] border border-slate-200 dark:border-teal-900/40 rounded-lg text-center font-mono font-bold tracking-widest text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpInput.length < 6}
                      className="px-3 py-1.5 bg-[#4A5D23] hover:bg-[#3D4C1D] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Code"}
                    </button>
                  </div>
                  {otpStatusMsg && <p className="text-[10px] text-slate-600 dark:text-slate-300">{otpStatusMsg}</p>}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Confidential Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-[#556B4B] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#556B4B] hover:text-[#1C2618] cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Confirm Confidential Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="flex items-start gap-2 pt-1 text-xs text-[#556B4B] dark:text-[#A3B799]">
              <input
                type="checkbox"
                id="dpdp-consent"
                checked={dpdpConsent}
                onChange={(e) => setDpdpConsent(e.target.checked)}
                className="mt-0.5 rounded accent-[#4A5D23] cursor-pointer"
              />
              <label htmlFor="dpdp-consent" className="leading-snug cursor-pointer">
                I hereby acknowledge and grant statutory consent under the DPDP Act 2023 for clinical processing of medical data pursuant to the{" "}
                <Link href="/terms" target="_blank" className="underline font-semibold hover:text-[#2C3A27]">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="underline font-semibold hover:text-[#2C3A27]">
                  Privacy Policy
                </Link>.
              </label>
            </div>
          )}

          <AntigravityButton variant="primary" size="lg" className="w-full mt-2 cursor-pointer" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "Sign In to Account" : mode === "register" ? "Complete Registration" : "Send Password Recovery"}
          </AntigravityButton>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="w-full border-t border-[#A3B799]/30" />
          <span className="bg-[#F5F7F3] dark:bg-[#1C2618] px-3 text-[11px] text-[#556B4B] uppercase tracking-wider font-mono">
            OR
          </span>
        </div>

        <AntigravityButton
          variant="secondary"
          size="md"
          className="w-full cursor-pointer"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Google Single Sign-On"}
        </AntigravityButton>
      </AppleLiquidCard>

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