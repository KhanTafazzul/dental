"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, Check, X } from "lucide-react";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [functionalConsent, setFunctionalConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConsent = localStorage.getItem("meity_dpdp_cookie_consent");
      if (!savedConsent) {
        setIsVisible(true);
      } else {
        try {
          const parsed = JSON.parse(savedConsent);
          setFunctionalConsent(Boolean(parsed.functional));
          setAnalyticsConsent(Boolean(parsed.analytics));
        } catch {
          // Default fallback
        }
      }
    }
  }, []);

  const saveConsentState = (functional: boolean, analytics: boolean) => {
    if (typeof window === "undefined") return;
    const consentPayload = {
      necessary: true,
      functional,
      analytics,
      timestamp: new Date().toISOString(),
      framework: "MEITY DPDP 2023 Rules 2025",
    };
    localStorage.setItem("meity_dpdp_cookie_consent", JSON.stringify(consentPayload));
    window.dispatchEvent(new CustomEvent("meity_dpdp_cookie_consent_changed", { detail: consentPayload }));
    setIsVisible(false);
    setShowModal(false);
  };

  if (!isVisible && !showModal) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && !showModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50"
          >
            <AppleLiquidCard variant="dark" className="p-5 space-y-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#556B4B] flex items-center justify-center text-white">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F5F7F3]">DPDP 2023 Cookie & Privacy Consent</h3>
                    <TelemetryBadge label="Rule 4 Compliant" variant="sage" className="scale-75 -ml-2" />
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#A3B799] hover:text-white transition"
                  title="Customize Preferences"
                  aria-label="Customize Cookie Preferences"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-[#A3B799] leading-relaxed">
                We process strictly necessary cookies for scheduling & clinic security. Non-essential cookies are disabled until explicitly accepted per Section 5 of DPDP Act 2023.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <AntigravityButton
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => saveConsentState(true, true)}
                >
                  Accept All
                </AntigravityButton>
                <AntigravityButton
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => saveConsentState(false, false)}
                >
                  Reject Non-Essential
                </AntigravityButton>
              </div>
            </AppleLiquidCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Customization Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <AppleLiquidCard variant="dark" className="w-full max-w-lg p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-[#A3B799]" />
                  <h2 className="text-sm font-bold text-[#F5F7F3]">Cookie Preferences (MEITY DPDP 2023)</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#A3B799]"
                  aria-label="Close preferences modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#F5F7F3]">Strictly Necessary (Always Active)</h3>
                    <p className="text-[11px] text-[#A3B799]">Essential for clinic login, security, & appointment booking.</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#F5F7F3]">Functional & Clinic Preferences</h3>
                    <p className="text-[11px] text-[#A3B799]">Remembers selected branch, family profiles, & language choice.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={functionalConsent}
                    onChange={(e) => setFunctionalConsent(e.target.checked)}
                    className="w-4 h-4 accent-[#556B4B] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#F5F7F3]">Performance Analytics</h3>
                    <p className="text-[11px] text-[#A3B799]">Aggregated page load telemetry. Section 9(3) minor tracking is disabled.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="w-4 h-4 accent-[#556B4B] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <AntigravityButton
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => saveConsentState(functionalConsent, analyticsConsent)}
                >
                  Save Custom Preferences
                </AntigravityButton>
              </div>
            </AppleLiquidCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
