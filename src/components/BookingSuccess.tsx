"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Mail,
  Home,
  Sparkles,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Printer,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import DentalLogo from "@/components/DentalLogo";
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
        setError("No appointment reference provided. Please restart booking.");
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
              name,
              address,
              phone
            )
          `)
          .eq("id", appointmentId)
          .single();

        if (fetchErr || !data) {
          throw new Error("Appointment confirmation could not be loaded from database.");
        }

        setAppointment(data);
      } catch (err: any) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Could not retrieve appointment record.");
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
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-red-500/20 text-center space-y-4 font-ui shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold font-display text-[#2C3325] dark:text-white">Booking Record Missing</h3>
        <p className="text-xs text-[#556B4B]">{error || "Record could not be retrieved."}</p>
        <button
          onClick={() => router.push(`/${branchSlug}/book`)}
          className="w-full py-3.5 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs transition cursor-pointer"
        >
          Return to Booking Page
        </button>
      </div>
    );
  }

  const doctor = appointment.doctors;
  const branch = appointment.branches;
  const branchName = branch?.name || (isHazara ? "Hazara Dental Clinic" : "Family Dental Care");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-6 font-ui"
    >
      {/* Top Success Badge Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E4E7D3] dark:bg-[#2C3A27] text-[#4A5D23] dark:text-[#88B04B] flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] dark:text-[#88B04B] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Confirmed Clinical Reservation
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#2C3325] dark:text-white">
          Appointment Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-[#556B4B] dark:text-[#A3B799] max-w-md mx-auto">
          Your dental consultation has been registered in the clinic timetable. A confirmation has been dispatched to your mobile.
        </p>
      </div>

      {/* Boarding Pass Style Clinical Voucher */}
      <div className="rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/20 shadow-xl overflow-hidden">
        {/* Top Header of Voucher */}
        <div className="p-6 bg-gradient-to-r from-[#2C3325] to-[#3D4C1D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DentalLogo size={28} />
            <div>
              <span className="text-sm font-bold font-display tracking-tight block text-white">{branchName}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A3B799]">Official Consultation Pass</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono block text-[#A3B799]">Token Ref</span>
            <span className="text-xs font-mono font-bold text-white">#{appointment.id.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#4A5D23]/10">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#556B4B] block">Date</span>
              <span className="text-xs sm:text-sm font-bold text-[#2C3325] dark:text-white flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#4A5D23]" /> {appointment.appointment_date}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#556B4B] block">Time Slot</span>
              <span className="text-xs sm:text-sm font-bold text-[#2C3325] dark:text-white flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#4A5D23]" /> {appointment.appointment_time}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#556B4B] block">Assigned Doctor</span>
              <span className="text-xs sm:text-sm font-bold text-[#2C3325] dark:text-white block mt-0.5 truncate">
                Dr. {doctor?.name || "Clinic Surgeon"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#556B4B] block">Status</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] mt-0.5">
                Confirmed
              </span>
            </div>
          </div>

          {/* Patient Details & Check-In Code */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-[#F0F2EB] dark:bg-[#141F16] border border-[#4A5D23]/15">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <span className="text-[10px] font-mono uppercase text-[#556B4B] block">Registered Patient</span>
              <h3 className="text-sm font-bold text-[#2C3325] dark:text-white">{appointment.patient_name}</h3>
              <p className="text-xs text-[#556B4B]">{appointment.patient_phone}</p>
              {appointment.notes && (
                <p className="text-[11px] text-[#556B4B] italic pt-1">&ldquo;{appointment.notes}&rdquo;</p>
              )}
            </div>

            {/* Check-In Simulated QR Code */}
            <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/20 shadow-sm shrink-0">
              <QrCode className="w-16 h-16 text-[#2C3325] dark:text-white" />
              <span className="text-[9px] font-mono text-[#556B4B]">CLINIC CHECK-IN</span>
            </div>
          </div>

          {/* Clinic Guidelines */}
          <div className="flex items-start gap-2.5 text-xs text-[#556B4B] dark:text-[#A3B799] bg-[#E4E7D3]/40 dark:bg-[#182622] p-3.5 rounded-2xl border border-[#4A5D23]/15">
            <ShieldCheck className="w-4 h-4 text-[#4A5D23] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Please arrive 10 minutes prior to your slot. Show this voucher or provide your registered WhatsApp mobile number at the reception desk for instant check-in.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-[#FDFBF7] dark:bg-[#141F16] border-t border-[#4A5D23]/15 flex flex-col sm:flex-row gap-3">
          <Link
            href="/account"
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>View in Patient Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="flex-1 py-3.5 px-4 rounded-2xl border border-[#4A5D23]/20 hover:bg-[#F0F2EB] dark:hover:bg-[#1C2618] text-[#2C3325] dark:text-white font-display font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function BookingSuccess({ branchSlug }: BookingSuccessProps) {
  return (
    <ProgressiveLoader skeleton={<BookingSuccessSkeleton />}>
      <BookingSuccessContent branchSlug={branchSlug} />
    </ProgressiveLoader>
  );
}
