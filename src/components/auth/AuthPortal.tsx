"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
} from "@/lib/firebase";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [showDpdpModal, setShowDpdpModal] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("falix_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const savePatientSession = (userEmail: string, name?: string, uid?: string, photoURL?: string) => {
    if (typeof window === "undefined") return;
    const sessionObj = {
      email: userEmail.trim().toLowerCase(),
      fullName: name || fullName || userEmail.split("@")[0],
      uid: uid || "user_" + Date.now(),
      avatarUrl: photoURL || "",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem("falix_patient_user", JSON.stringify(sessionObj));
    window.dispatchEvent(new Event("falix_auth_changed"));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const res = await resetPassword(email);
        if (res.error) setError(res.error);
        else setSuccessMsg("Password recovery email sent! Check your inbox.");
      } catch (err: any) {
        setError(err.message || "Failed to send recovery email.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "register") {
      if (!fullName.trim()) {
        setError("Please enter your full legal name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please check again.");
        return;
      }
      if (!dpdpConsent) {
        setError("Please accept the DPDP Act 2023 consent to create an account.");
        return;
      }

      setLoading(true);
      try {
        const res = await registerWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          savePatientSession(res.user?.email || email, fullName, res.user?.uid);
          setSuccessMsg("Account created successfully! Redirecting...");
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "/account";
            window.location.href = redirectUrl;
          }, 800);
        }
      } catch (err: any) {
        setError(err.message || "Registration failed.");
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
          setSuccessMsg("Successfully signed in! Redirecting...");
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "/account";
            window.location.href = redirectUrl;
          }, 800);
        }
      } catch (err: any) {
        setError(err.message || "Sign in failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!dpdpConsent) {
      setError("Please accept the DPDP Act 2023 consent before signing in.");
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.error) {
        setError(res.error);
      } else {
        savePatientSession(res.user?.email || email, res.user?.displayName || fullName, res.user?.uid, res.user?.photoURL || "");
        setSuccessMsg("Authenticated via Google! Redirecting...");
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get("redirect") || "/account";
          window.location.href = redirectUrl;
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F5F7F3] dark:bg-[#0F150D] blueprint-grid transition-colors">
      <AppleLiquidCard variant="light" className="w-full max-w-lg p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <DentalLogo size={34} />
          </Link>
          <TelemetryBadge label="Secure Auth" code="256-BIT" variant="sage" />
        </div>

        {/* Mode Switch Tabs */}
        {mode !== "forgot" ? (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#E2E8DC]/80 dark:bg-[#2C3A27]/60 border border-[#A3B799]/30">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-[#2C3A27] text-[#F5F7F3] shadow-md"
                  : "text-[#556B4B] dark:text-[#A3B799] hover:text-[#1C2618]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#556B4B] hover:text-[#2C3A27]"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Sign In
          </button>
        )}

        {/* Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aman Khan"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
              <input
                type="email"
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
                <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-[#556B4B] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#556B4B] hover:text-[#1C2618]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C3A27] dark:text-[#E2E8DC]">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#556B4B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>
            </div>
          )}

          <AntigravityButton variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "Sign In to Account" : mode === "register" ? "Create Account" : "Send Password Reset"}
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
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Google"}
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