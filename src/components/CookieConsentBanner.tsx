"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, Check, X, Settings } from "lucide-react";
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
      }
    }
  }, []);

  const saveConsentState = (necessary: boolean, functional: boolean, analytics: boolean) => {
    if (typeof window === "undefined") return;
    const consentPayload = {
      necessary: true,
      functional,
      analytics,
      timestamp: new Date().toISOString(),
      framework: "MEITY DPDP 2023 Rules 2025",
    };
    localStorage.setItem("meity_dpdp_cookie_consent", JSON.stringify(consentPayload));
    setIsVisible(false);
    setShowModal(false);
  };

  if (!isVisible && !showModal) return null;

  return (
    <AnimatePresence>
      {isVisible && (
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
            </div>

            <p className="text-[11px] text-[#A3B799] leading-relaxed">
              We process strictly necessary cookies for scheduling & clinic security. Non-essential cookies are disabled until explicitly accepted per Section 5 of DPDP Act 2023.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <AntigravityButton
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => saveConsentState(true, true, true)}
              >
                Accept All
              </AntigravityButton>
              <AntigravityButton
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => saveConsentState(true, false, false)}
              >
                Reject Non-Essential
              </AntigravityButton>
            </div>
          </AppleLiquidCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
