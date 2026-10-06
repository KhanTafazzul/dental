"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { sendAppointmentEmail } from "@/app/admin/actions";
import {
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Users,
  LogIn,
  Lock,
} from "lucide-react";
import { FamilyMember, calculateAgeFromDob, getStoredFamilyMembers } from "@/lib/family";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { BookingSkeleton } from "@/components/skeletons/BookingSkeleton";

const TIME_SLOTS = [
  { value: "09:00:00", label: "09:00 AM" },
  { value: "10:00:00", label: "10:00 AM" },
  { value: "11:00:00", label: "11:00 AM" },
  { value: "12:00:00", label: "12:00 PM" },
  { value: "14:00:00", label: "02:00 PM" },
  { value: "15:00:00", label: "03:00 PM" },
  { value: "16:00:00", label: "04:00 PM" },
  { value: "17:00:00", label: "05:00 PM" },
];

interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  picture_url: string | null;
}

interface Branch {
  id: string;
  name: string;
  slug: string;
}

interface BookingFormProps {
  branchSlug: "hazara" | "family";
}

function BookingFormContent({ branchSlug }: BookingFormProps) {
  const isHazara = branchSlug === "hazara";
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("self");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("falix_patient_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setIsAuthenticated(true);
          const userId = parsed.uid || parsed.id || "guest_user";
          const storedFamily = getStoredFamilyMembers(userId);

          const selfMember: FamilyMember = {
            id: "self",
            userId,
            fullName: parsed.fullName || "Self",
            dob: parsed.dob || "1995-01-01",
            relationship: "Self",
            mobile: parsed.mobile || "",
            email: parsed.email || "",
            gender: "Male",
          };

          const combined = [selfMember, ...storedFamily.filter((f) => f.id !== "self")];
          setFamilyMembers(combined);

          const searchParams = new URLSearchParams(window.location.search);
          const urlFamId = searchParams.get("familyId");
          const activeFam = combined.find((f) => f.id === urlFamId) || selfMember;

          setSelectedProfileId(activeFam.id);
          setPatientName(activeFam.fullName);
          setPatientAge(String(calculateAgeFromDob(activeFam.dob)));
          setPatientMobile(activeFam.mobile || parsed.mobile || "");
          setPatientEmail(activeFam.email || parsed.email || "");
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const chosen = familyMembers.find((f) => f.id === profileId);
    if (chosen) {
      setPatientName(chosen.fullName);
      setPatientAge(String(calculateAgeFromDob(chosen.dob)));
      if (chosen.mobile) setPatientMobile(chosen.mobile);
      if (chosen.email) setPatientEmail(chosen.email);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: bData } = await supabase.from("branches").select("id, name, slug").eq("slug", branchSlug).single();
        if (bData) setBranch(bData);

        const { data: dData } = await supabase.from("doctors").select("id, name, specialty, picture_url").order("name");
        if (dData) setDoctors(dData);
      } catch (err: any) {
        console.error("Booking load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [branchSlug]);

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setBookedSlots([]);
      return;
    }
    async function fetchSlots() {
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("doctor_id", selectedDoctorId)
        .eq("appointment_date", selectedDate)
        .neq("status", "cancelled");
      if (data) {
        setBookedSlots(data.map((item: any) => item.appointment_time));
      }
    }
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientMobile || !selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const selectedDoc = doctors.find((d) => d.id === selectedDoctorId);
      const { data, error: insertError } = await supabase
        .from("appointments")
        .insert({
          branch_id: branch?.id || null,
          doctor_id: selectedDoctorId,
          patient_name: patientName.trim(),
          patient_age: patientAge ? parseInt(patientAge, 10) : null,
          patient_phone: patientMobile.trim(),
          patient_email: patientEmail.trim() || null,
          appointment_date: selectedDate,
          appointment_time: selectedTimeSlot,
          notes: problemDescription.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (patientEmail.trim() && data) {
        try {
          await sendAppointmentEmail(data.id);
        } catch (mailErr) {
          console.error("Email send notice:", mailErr);
        }
      }

      router.push(`/${branchSlug}/book/success?id=${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated === false) {
    return (
      <AppleLiquidCard variant="light" className="p-8 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#2C3A27] text-[#F5F7F3] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">Patient Login Required</h2>
          <p className="text-xs text-[#556B4B]">
            To schedule a appointment, please log in to your patient account first.
          </p>
        </div>
        <AntigravityButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push(`/login?redirect=/${branchSlug}/book`)}
        >
          <LogIn className="w-4 h-4" /> Sign In to Book Appointment
        </AntigravityButton>
      </AppleLiquidCard>
    );
  }

  return (
    <AppleLiquidCard variant="light" className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#A3B799]/30 pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1C2618] dark:text-[#F5F7F3]">
            Schedule Appointment ({isHazara ? "Hazara Branch" : "Family Branch"})
          </h2>
          <p className="text-xs text-[#556B4B]">Select patient profile, date, and preferred doctor</p>
        </div>
        <TelemetryBadge label={isHazara ? "Hazara Clinic" : "Family Clinic"} code="STEP 1" variant="olive" />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient Profile Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#2C3A27] dark:text-[#E2E8DC] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#556B4B]" /> Select Patient Profile
          </label>
          <select
            value={selectedProfileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
          >
            {familyMembers.map((fam) => (
              <option key={fam.id} value={fam.id} className="bg-[#1C2618] text-white">
                {fam.fullName} ({fam.relationship} - Age {calculateAgeFromDob(fam.dob)})
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Doctor Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#2C3A27] dark:text-[#E2E8DC]">Select Specialist Doctor</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {doctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-[#2C3A27] text-[#F5F7F3] border-white/20 shadow-md"
                      : "bg-[#E2E8DC]/40 dark:bg-[#1C2618]/40 border-[#A3B799]/30 hover:border-[#556B4B]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#556B4B] text-[#F5F7F3] font-bold flex items-center justify-center shrink-0">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">{doc.name}</h3>
                    <p className="text-[10px] opacity-80">{doc.specialty || "Dental Specialist"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Date & Slot Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#556B4B]">Appointment Date</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#556B4B]">Preferred Time Slot</label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
            >
              <option value="">Choose Time Slot</option>
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot.value);
                return (
                  <option key={slot.value} value={slot.value} disabled={isBooked} className="bg-[#1C2618] text-white">
                    {slot.label} {isBooked ? "(Booked)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#556B4B]">Dental Problem / Notes (Optional)</label>
          <textarea
            rows={3}
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="Tooth pain, routine cleaning, braces consultation..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
          />
        </div>

        <AntigravityButton variant="primary" size="lg" className="w-full mt-4" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Appointment Booking"}
        </AntigravityButton>
      </form>
    </AppleLiquidCard>
  );
}

export default function BookingForm({ branchSlug }: BookingFormProps) {
  return (
    <ProgressiveLoader skeleton={<BookingSkeleton />}>
      <BookingFormContent branchSlug={branchSlug} />
    </ProgressiveLoader>
  );
}
