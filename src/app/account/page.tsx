import React from "react";
import PatientAccountPortal from "@/components/patient/PatientAccountPortal";
import Link from "next/link";
import DentalLogo from "@/components/DentalLogo";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

export const metadata = {
  title: "My Patient Account & Settings | Falix Dental Care",
  description: "Manage your patient profile, family members, contact details, medical history, invoices, and lab reports.",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#F5F7F3] dark:bg-[#0F150D] text-[#1C2618] dark:text-[#E2E8DC] blueprint-grid transition-colors py-8 px-4 sm:px-8">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <DentalLogo size={36} />
          <TelemetryBadge label="Patient Portal" code="PORTAL-V2" variant="sage" />
        </Link>

        <Link href="/">
          <AntigravityButton variant="secondary" size="sm">
            ← Return to Clinic Gateway
          </AntigravityButton>
        </Link>
      </div>

      <PatientAccountPortal />
    </div>
  );
}
