"use client";

import React, { useState } from "react";
import { loginDoctor } from "@/app/admin/actions";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

interface DoctorLoginProps {
  doctorName: string;
  doctorSlug: string;
}

export default function DoctorLogin({ doctorName, doctorSlug }: DoctorLoginProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginDoctor(doctorSlug, password);
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F3] dark:bg-[#0F150D] flex items-center justify-center p-4 blueprint-grid">
      <AppleLiquidCard variant="light" className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-[#2C3A27] text-[#F5F7F3] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <TelemetryBadge label="Dentist Portal" code={doctorSlug.toUpperCase()} variant="olive" />
          <h2 className="text-xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">Dr. {doctorName}</h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#556B4B]">Security Password</label>
            <input
              type="password"
              required
              placeholder="Enter your portal password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
            />
          </div>

          <AntigravityButton variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock Dentist Portal"}
          </AntigravityButton>
        </form>
      </AppleLiquidCard>
    </div>
  );
}
