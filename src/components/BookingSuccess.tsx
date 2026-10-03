"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Mail,
  Home,
  Sparkles,
} from "lucide-react";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { BookingSuccessSkeleton } from "@/components/skeletons/BookingSuccessSkeleton";

interface BookingSuccessProps {
  branchSlug: "hazara" | "family";
}

function BookingSuccessContent({ branchSlug }: BookingSuccessProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id");
  const isHazara = branchSlug === "hazara";

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointment() {
      if (!appointmentId) {
        setError("No appointment ID found. Please go back to booking.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchErr } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            notes,
            patient_name,
            patient_age,
            patient_phone,
            patient_email,
            doctors (
              name,
              specialty
            ),
            branches (
              name
            )
          `)
          .eq("id", appointmentId)
          .single();

        if (fetchErr || !data) {
          throw new Error("Appointment details could not be found.");
        }

        setAppointment(data);
      } catch (err: any) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Could not load appointment details.");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [appointmentId]);

  if (loading) {
    return <BookingSuccessSkeleton />;
  }

  if (error || !appointment) {
    return (
      <AppleLiquidCard variant="light" className="max-w-md mx-auto p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-[#1C2618] dark:text-[#F5F7F3]">Booking Not Found</h3>
        <p className="text-xs text-[#556B4B]">{error || "Record missing."}</p>
        <AntigravityButton variant="primary" size="md" className="w-full" onClick={() => router.push(`/${branchSlug}/book`)}>
          Return to Booking Page
        </AntigravityButton>
      </AppleLiquidCard>
    );
  }

  const doctor = appointment.doctors;
  const branch = appointment.branches;

  return (
    <AppleLiquidCard variant="light" className="max-w-xl mx-auto p-6 sm:p-8 text-center space-y-6">
      <div className="w-16 h-16 bg-[#2C3A27] text-[#F5F7F3] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
        <CheckCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <TelemetryBadge label="Confirmed Reservation" code="WAHA DIGEST QUEUED" variant="olive" />
        <h2 className="text-2xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">Appointment Confirmed!</h2>
        <p className="text-xs text-[#556B4B]">Your slot is locked in our clinic timetable.</p>
      </div>

      <div className="text-left rounded-xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-[#A3B799]/30 p-5 space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-[#A3B799]/20 pb-2">
          <span className="font-bold text-[#1C2618] dark:text-[#F5F7F3]">Booking Details</span>
          <span className="font-mono text-[11px] text-[#556B4B]">ID: {appointment.id.substring(0, 8)}...</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-[#556B4B] block font-mono uppercase">Clinic</span>
            <span className="font-semibold text-[#1C2618] dark:text-[#F5F7F3]">{branch?.name || (isHazara ? "Hazara Branch" : "Family Branch")}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#556B4B] block font-mono uppercase">Doctor</span>
            <span className="font-semibold text-[#1C2618] dark:text-[#F5F7F3]">Dr. {doctor?.name || "Clinic Specialist"}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#556B4B] block font-mono uppercase">Date</span>
            <span className="font-semibold text-[#1C2618] dark:text-[#F5F7F3]">{appointment.appointment_date}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#556B4B] block font-mono uppercase">Time Slot</span>
            <span className="font-semibold text-[#1C2618] dark:text-[#F5F7F3]">{appointment.appointment_time}</span>
          </div>
        </div>

        <div className="border-t border-[#A3B799]/20 pt-3 space-y-1">
          <p className="font-semibold text-[#1C2618] dark:text-[#F5F7F3]">Patient: {appointment.patient_name}</p>
          <p className="text-[#556B4B]">Phone: {appointment.patient_phone}</p>
          {appointment.patient_email && <p className="text-[#556B4B]">Email: {appointment.patient_email}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <AntigravityButton variant="secondary" size="md" className="flex-1" onClick={() => router.push("/")}>
          <Home className="w-4 h-4" /> Home
        </AntigravityButton>
        <AntigravityButton variant="primary" size="md" className="flex-1" onClick={() => router.push(`/${branchSlug}/book`)}>
          <ArrowLeft className="w-4 h-4" /> Book Another
        </AntigravityButton>
      </div>
    </AppleLiquidCard>
  );
}

export default function BookingSuccess({ branchSlug }: BookingSuccessProps) {
  return (
    <ProgressiveLoader skeleton={<BookingSuccessSkeleton />}>
      <BookingSuccessContent branchSlug={branchSlug} />
    </ProgressiveLoader>
  );
}
