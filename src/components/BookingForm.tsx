"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { bookPatientAppointmentAction } from "@/actions/appointments.actions";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  LogIn,
  Lock,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Plus,
  Check,
} from "lucide-react";
import { FamilyMember, calculateAgeFromDob, getStoredFamilyMembers } from "@/lib/family";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { BookingSkeleton } from "@/components/skeletons/BookingSkeleton";

const TIME_SLOTS = [
  { value: "09:00:00", label: "09:00 AM", period: "morning" },
  { value: "10:00:00", label: "10:00 AM", period: "morning" },
  { value: "11:00:00", label: "11:00 AM", period: "morning" },
  { value: "12:00:00", label: "12:00 PM", period: "morning" },
  { value: "14:00:00", label: "02:00 PM", period: "afternoon" },
  { value: "15:00:00", label: "03:00 PM", period: "afternoon" },
  { value: "16:00:00", label: "04:00 PM", period: "afternoon" },
  { value: "17:00:00", label: "05:00 PM", period: "evening" },
  { value: "18:00:00", label: "06:00 PM", period: "evening" },
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

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("self");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00:00");

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
            gender: parsed.gender || "Male",
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
        if (dData && dData.length > 0) {
          setDoctors(dData);
          setSelectedDoctorId(dData[0].id);
        }
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
    if (!patientName.trim() || !patientMobile.trim() || !selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      setError("Please fill out all required details (Patient Name, Mobile, Doctor, Date, and Time Slot).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await bookPatientAppointmentAction({
        branchSlug,
        doctorId: selectedDoctorId,
        patientName: patientName.trim(),
        patientAge: patientAge ? parseInt(patientAge, 10) : null,
        patientPhone: patientMobile.trim(),
        patientEmail: patientEmail.trim() || null,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        notes: problemDescription.trim() || null,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to confirm appointment booking.");
      }

      router.push(`/${branchSlug}/book/success?id=${res.data?.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated === false) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/20 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#E4E7D3] dark:bg-[#2C3A27] text-[#4A5D23] dark:text-[#88B04B] flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-[#2C3325] dark:text-white">Sign In Required</h2>
          <p className="text-xs text-[#556B4B] dark:text-[#A3B799] leading-relaxed">
            To ensure your dental records and clinical follow-ups are preserved, please authenticate with your mobile number or password.
          </p>
        </div>
        <button
          onClick={() => router.push(`/login?redirect=/${branchSlug}/book`)}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4A5D23]/25"
        >
          <LogIn className="w-4 h-4" /> Sign In to Book Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-ui">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#2C3325] to-[#3E4D21] text-white space-y-2 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#88B04B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-[#E4E7D3] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#88B04B]" />
              {isHazara ? "Hazara Restorative & Orthodontic Clinic" : "Family Dental Care Branch"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              Schedule Your Dental Consultation
            </h1>
            <p className="text-xs sm:text-sm text-[#E4E7D3]/80">
              Select who this appointment is for, choose your specialist, and pick an available time slot.
            </p>
          </div>
          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1 text-[11px] font-mono text-[#E4E7D3]/70">
            <span>BRANCH CODE</span>
            <span className="font-bold text-white px-2.5 py-1 rounded-lg bg-white/10">{branchSlug.toUpperCase()}-01</span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Circular Family Member Switcher */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-[#2C3325] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4A5D23]" /> 1. Who is this appointment for?
              </h2>
              <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">
                Click a family member profile below to auto-load their age and contact info.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/family")}
              className="text-xs font-semibold text-[#4A5D23] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Manage Family
            </button>
          </div>

          {/* Circular Button Family Member Switcher Grid */}
          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
            {familyMembers.map((fam) => {
              const isSelected = selectedProfileId === fam.id;
              const initials = fam.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  key={fam.id}
                  type="button"
                  onClick={() => handleProfileChange(fam.id)}
                  className={`flex items-center gap-3 p-2.5 pr-4 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#4A5D23] text-white border-[#4A5D23] shadow-md shadow-[#4A5D23]/25"
                      : "bg-[#F0F2EB] dark:bg-[#141F16] text-[#2C3325] dark:text-[#E2E8DC] border-[#4A5D23]/15 hover:border-[#4A5D23]/40"
                  }`}
                >
                  {/* Circular Avatar Button */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-display text-xs shrink-0 transition ${
                      isSelected
                        ? "bg-white text-[#4A5D23] shadow-inner"
                        : "bg-[#4A5D23] text-white"
                    }`}
                  >
                    {initials || "P"}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>{fam.fullName}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-[#556B4B] dark:text-[#A3B799]"}`}>
                      {fam.relationship} • Age {calculateAgeFromDob(fam.dob)}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Patient Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#4A5D23]/10">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#556B4B]">Patient Name</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#556B4B]">Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Years"
                className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#556B4B]">WhatsApp Mobile</label>
              <input
                type="tel"
                required
                value={patientMobile}
                onChange={(e) => setPatientMobile(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Doctor Selection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-[#2C3325] dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#4A5D23]" /> 2. Select Specialist Doctor
            </h2>
            <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">
              Choose from our verified clinical team available at this branch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {doctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? "bg-[#4A5D23] text-white border-[#4A5D23] shadow-md shadow-[#4A5D23]/20"
                      : "bg-[#F0F2EB] dark:bg-[#141F16] text-[#2C3325] dark:text-[#E2E8DC] border-[#4A5D23]/15 hover:border-[#4A5D23]/30"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-base shrink-0 shadow-sm ${
                      isSelected ? "bg-white text-[#4A5D23]" : "bg-[#4A5D23] text-white"
                    }`}
                  >
                    {doc.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-xs sm:text-sm font-bold truncate">Dr. {doc.name}</h3>
                    <p className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-[#556B4B] dark:text-[#A3B799]"}`}>
                      {doc.specialty || "Senior Dental Surgeon"}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 ml-auto text-white shrink-0" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Date & Available Free Time Slots */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-[#2C3325] dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4A5D23]" /> 3. Select Consultation Date & Time Slot
            </h2>
            <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">
              Pick your preferred visit date to see live free consultation slots.
            </p>
          </div>

          <div className="max-w-xs space-y-1">
            <label className="text-xs font-semibold text-[#556B4B] block">Consultation Date</label>
            <input
              type="date"
              min={today}
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl premium-input text-xs sm:text-sm font-medium"
            />
          </div>

          {selectedDate && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-[#556B4B] block">Available Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot.value);
                  const isSelected = selectedTimeSlot === slot.value;

                  return (
                    <button
                      key={slot.value}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTimeSlot(slot.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isBooked
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent cursor-not-allowed opacity-50 line-through"
                          : isSelected
                          ? "bg-[#4A5D23] text-white shadow-md shadow-[#4A5D23]/25 scale-105"
                          : "bg-[#F0F2EB] dark:bg-[#141F16] text-[#2C3325] dark:text-[#E2E8DC] border border-[#4A5D23]/15 hover:border-[#4A5D23]"
                      }`}
                    >
                      <span>{slot.label}</span>
                      <span className="text-[9px] font-sans font-normal opacity-75">
                        {isBooked ? "Booked" : isSelected ? "Selected" : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dental Problem Note */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-[#556B4B] block">
              Symptoms or Clinical Problem (Optional)
            </label>
            <textarea
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="e.g. Tooth sensitivity, severe molar ache, routine cleaning, crown review..."
              className="w-full px-4 py-3 rounded-2xl premium-input text-xs sm:text-sm font-medium"
            />
          </div>
        </div>

        {/* Submit Booking Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-2 text-xs text-[#556B4B] dark:text-[#A3B799]">
            <ShieldCheck className="w-4 h-4 text-[#4A5D23] shrink-0" />
            <span>Instant WhatsApp & Email confirmation will be dispatched upon booking.</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-sm transition shadow-lg shadow-[#4A5D23]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Confirm Appointment Booking</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default function BookingForm({ branchSlug }: BookingFormProps) {
  return (
    <ProgressiveLoader skeleton={<BookingSkeleton />}>
      <BookingFormContent branchSlug={branchSlug} />
    </ProgressiveLoader>
  );
}
