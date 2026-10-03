"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Camera,
  Save,
  RefreshCw,
  Users,
  Plus,
  Calendar,
  CreditCard,
  Stethoscope,
  ArrowRight,
  Trash2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  FamilyMember,
  calculateAgeFromDob,
  getStoredFamilyMembers,
  saveStoredFamilyMember,
  deleteStoredFamilyMember,
} from "@/lib/family";
import { AppleLiquidCard } from "@/components/ui/AppleLiquidCard";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { PatientAccountSkeleton } from "@/components/skeletons/PatientAccountSkeleton";

export interface PatientProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  dob?: string;
  age?: number;
  gender?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  dentalHistory?: string;
  googleLinked?: boolean;
}

const SAMPLE_BILLS = [
  { id: "inv_101", familyMemberName: "Self", date: "2026-09-28", treatment: "Root Canal Treatment & Crown", amount: "₹4,500", status: "Paid" },
  { id: "inv_102", familyMemberName: "Self", date: "2026-08-15", treatment: "Teeth Scaling & Polishing", amount: "₹1,200", status: "Paid" },
  { id: "inv_103", familyMemberName: "Ridhima (Daughter)", date: "2026-09-10", treatment: "Pediatric Dental Cleaning & Fluoride", amount: "₹1,500", status: "Paid" },
  { id: "inv_104", familyMemberName: "Rahul (Son)", date: "2026-09-02", treatment: "Dental Checkup & Sealant", amount: "₹800", status: "Paid" },
];

const SAMPLE_REPORTS = [
  { id: "rep_201", familyMemberName: "Self", date: "2026-09-28", type: "X-Ray & Prescription", doctor: "Dr. Aman Khan", fileUrl: "#" },
  { id: "rep_202", familyMemberName: "Ridhima (Daughter)", date: "2026-09-10", type: "Pediatric Dental Report", doctor: "Dr. Sarah Ahmed", fileUrl: "#" },
];

const EMPTY_PROFILE: PatientProfile = {
  id: "",
  fullName: "",
  email: "",
  mobile: "",
  avatarUrl: "",
  dob: "",
  age: undefined,
  gender: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  allergies: "",
  medicalConditions: "",
  dentalHistory: "",
  googleLinked: false,
};

function PatientAccountPortalContent() {
  const router = useRouter();

  const [initialProfile, setInitialProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<"profile" | "family" | "appointments" | "bills" | "reports">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("self");
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);

  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyDob, setNewFamilyDob] = useState("");
  const [newFamilyRelation, setNewFamilyRelation] = useState<FamilyMember["relationship"]>("Son");
  const [newFamilyMobile, setNewFamilyMobile] = useState("");
  const [newFamilyEmail, setNewFamilyEmail] = useState("");
  const [newFamilyGender] = useState<"Male" | "Female" | "Other">("Male");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("falix_patient_user");
        let loaded: PatientProfile = { ...EMPTY_PROFILE };

        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser) as PatientProfile & { uid?: string };
            const nameStr = (parsed.fullName || "").trim();
            loaded = {
              id: parsed.uid || parsed.id || "user_" + Date.now(),
              fullName: nameStr || (parsed.email ? parsed.email.split("@")[0] : "Patient User"),
              email: parsed.email || "",
              mobile: parsed.mobile || "",
              avatarUrl: parsed.avatarUrl || "",
              dob: parsed.dob || "",
              age: parsed.dob ? calculateAgeFromDob(parsed.dob) : parsed.age,
              gender: parsed.gender || "",
              address: parsed.address || "",
              emergencyContactName: parsed.emergencyContactName || "",
              emergencyContactPhone: parsed.emergencyContactPhone || "",
              allergies: parsed.allergies || "",
              medicalConditions: parsed.medicalConditions || "",
              dentalHistory: parsed.dentalHistory || "",
              googleLinked: true,
            };
          } catch {}
        } else {
          loaded = {
            id: "guest_user",
            fullName: "Aman Khan",
            email: "aman@example.com",
            mobile: "+91 8418878491",
            avatarUrl: "",
            gender: "Male",
            googleLinked: false,
          };
        }

        setInitialProfile(loaded);
        setProfile(loaded);
        setNewFamilyMobile(loaded.mobile);
        setNewFamilyEmail(loaded.email);

        const userId = loaded.id || "guest_user";
        const stored = getStoredFamilyMembers(userId);
        if (stored.length === 0) {
          const sample: FamilyMember[] = [
            {
              id: "fam_1",
              userId,
              fullName: `${loaded.fullName} (Self)`,
              dob: "1994-05-15",
              relationship: "Self",
              mobile: loaded.mobile,
              email: loaded.email,
              gender: "Male",
            },
            {
              id: "fam_2",
              userId,
              fullName: "Ridhima Khan",
              dob: "2021-08-10",
              relationship: "Daughter",
              mobile: loaded.mobile,
              email: loaded.email,
              gender: "Female",
            },
            {
              id: "fam_3",
              userId,
              fullName: "Rahul Khan",
              dob: "2018-03-22",
              relationship: "Son",
              mobile: loaded.mobile,
              email: loaded.email,
              gender: "Male",
            },
          ];
          setFamilyMembers(sample);
          localStorage.setItem(`falix_family_members_${userId}`, JSON.stringify(sample));
        } else {
          setFamilyMembers(stored);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const activeFamilyMember = useMemo(() => {
    if (selectedFamilyId === "self") {
      return {
        id: "self",
        fullName: profile.fullName || "Self",
        relationship: "Self",
        dob: profile.dob || "",
        age: profile.dob ? calculateAgeFromDob(profile.dob) : profile.age || 30,
        mobile: profile.mobile,
        email: profile.email,
      };
    }
    const found = familyMembers.find((f) => f.id === selectedFamilyId);
    if (found) return found;
    return {
      id: "self",
      fullName: profile.fullName || "Self",
      relationship: "Self",
      dob: profile.dob || "",
      age: profile.dob ? calculateAgeFromDob(profile.dob) : profile.age || 30,
      mobile: profile.mobile,
      email: profile.email,
    };
  }, [selectedFamilyId, familyMembers, profile]);

  const filteredBills = useMemo(() => {
    if (selectedFamilyId === "self") {
      return SAMPLE_BILLS.filter((b) => b.familyMemberName.includes("Self"));
    }
    return SAMPLE_BILLS.filter((b) =>
      b.familyMemberName.toLowerCase().includes(activeFamilyMember.fullName.split(" ")[0].toLowerCase())
    );
  }, [selectedFamilyId, activeFamilyMember]);

  const filteredReports = useMemo(() => {
    if (selectedFamilyId === "self") {
      return SAMPLE_REPORTS.filter((r) => r.familyMemberName.includes("Self"));
    }
    return SAMPLE_REPORTS.filter((r) =>
      r.familyMemberName.toLowerCase().includes(activeFamilyMember.fullName.split(" ")[0].toLowerCase())
    );
  }, [selectedFamilyId, activeFamilyMember]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedProfile = {
        ...profile,
        age: profile.dob ? calculateAgeFromDob(profile.dob) : profile.age,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("falix_patient_user", JSON.stringify(updatedProfile));
      }
      setProfile(updatedProfile);
      setInitialProfile(updatedProfile);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName || !newFamilyDob) return;

    const userId = profile.id || "guest_user";
    const newMember: FamilyMember = {
      id: "fam_" + Date.now(),
      userId,
      fullName: newFamilyName.trim(),
      dob: newFamilyDob,
      relationship: newFamilyRelation,
      mobile: newFamilyMobile || profile.mobile,
      email: newFamilyEmail || profile.email,
      gender: newFamilyGender,
    };

    const updated = saveStoredFamilyMember(userId, newMember);
    setFamilyMembers(updated);
    setNewFamilyName("");
    setNewFamilyDob("");
    setShowAddFamilyModal(false);
    alert(`Family member ${newMember.fullName} (${newMember.relationship}, Age ${calculateAgeFromDob(newMember.dob)}) added successfully!`);
  };

  const handleDeleteFamily = (id: string) => {
    const userId = profile.id || "guest_user";
    const updated = deleteStoredFamilyMember(userId, id);
    setFamilyMembers(updated);
    if (selectedFamilyId === id) setSelectedFamilyId("self");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setProfile((prev) => ({ ...prev, avatarUrl: url }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* ══ HEADER BAR WITH TOP-RIGHT FAMILY SWITCHER & BOOK BUTTON ══ */}
      <AppleLiquidCard variant="dark" className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#A3B799]" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#2C3A27] flex items-center justify-center text-[#F5F7F3] font-bold text-2xl border-2 border-[#A3B799]">
                {profile.fullName?.charAt(0) || "P"}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 bg-[#556B4B] hover:bg-[#6E8662] text-white rounded-xl shadow transition"
              title="Upload Avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#F5F7F3]">{profile.fullName}</h1>
              <TelemetryBadge label="Verified Patient" code="ACTIVE" variant="sage" />
            </div>
            <p className="text-xs text-[#A3B799] mt-0.5">{profile.email} • {profile.mobile}</p>
          </div>
        </div>

        {/* Top Right Family Switcher & Booking Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0F150D] p-2 rounded-xl border border-white/10">
            <Users className="w-4 h-4 text-[#A3B799]" />
            <select
              value={selectedFamilyId}
              onChange={(e) => setSelectedFamilyId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#F5F7F3] focus:outline-none cursor-pointer"
            >
              <option value="self" className="bg-[#1C2618] text-white">Select Active Profile ({profile.fullName})</option>
              {familyMembers.map((fam) => (
                <option key={fam.id} value={fam.id} className="bg-[#1C2618] text-white">
                  {fam.fullName} ({fam.relationship})
                </option>
              ))}
            </select>
          </div>

          <AntigravityButton
            variant="primary"
            size="md"
            onClick={() => router.push(`/hazara/book?familyId=${selectedFamilyId}`)}
          >
            Book Appointment <ArrowRight className="w-4 h-4" />
          </AntigravityButton>
        </div>
      </AppleLiquidCard>

      {/* ══ NAVIGATION TABS ══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#A3B799]/30">
        {[
          { id: "profile", label: "My Profile", icon: User },
          { id: "family", label: `Family Members (${familyMembers.length})`, icon: Users },
          { id: "appointments", label: "Appointments", icon: Calendar },
          { id: "bills", label: `Bills & Receipts (${filteredBills.length})`, icon: CreditCard },
          { id: "reports", label: `Clinical Reports (${filteredReports.length})`, icon: Stethoscope },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#2C3A27] text-[#F5F7F3] shadow-md border border-white/20"
                  : "bg-[#E2E8DC]/70 dark:bg-[#1C2618]/70 text-[#556B4B] dark:text-[#A3B799] hover:text-[#1C2618]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ TAB CONTENT ══ */}
      {activeTab === "profile" && (
        <AppleLiquidCard variant="light" className="p-6 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h2 className="text-base font-bold text-[#1C2618] dark:text-[#F5F7F3] flex items-center gap-2">
              <User className="w-4 h-4 text-[#556B4B]" /> Personal Patient Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#556B4B]">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#556B4B]">Date of Birth (Auto Calculates Age)</label>
                <input
                  type="date"
                  value={profile.dob || ""}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value, age: calculateAgeFromDob(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#556B4B]">Mobile Number</label>
                <input
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/40 bg-white/70 dark:bg-[#1C2618]/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#556B4B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#556B4B]">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-[#A3B799]/20 bg-[#E2E8DC]/50 dark:bg-[#0F150D]/50 text-xs text-[#556B4B]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#A3B799]/30">
              {showToast && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                </span>
              )}
              <AntigravityButton variant="primary" size="md" type="submit" disabled={isSaving} className="ml-auto">
                <Save className="w-4 h-4" /> Save Profile Changes
              </AntigravityButton>
            </div>
          </form>
        </AppleLiquidCard>
      )}

      {activeTab === "family" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3]">Linked Family Members</h2>
            <AntigravityButton variant="secondary" size="sm" onClick={() => setShowAddFamilyModal(true)}>
              <Plus className="w-4 h-4" /> Add New Family Member
            </AntigravityButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map((fam) => (
              <AppleLiquidCard key={fam.id} variant="light" className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#1C2618] dark:text-[#F5F7F3]">{fam.fullName}</h3>
                    <TelemetryBadge label={fam.relationship} code={`AGE: ${calculateAgeFromDob(fam.dob)}`} variant="sage" className="mt-1" />
                  </div>
                  {fam.relationship !== "Self" && (
                    <button onClick={() => handleDeleteFamily(fam.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#556B4B]">DOB: {fam.dob}</p>
                <p className="text-xs text-[#556B4B]">Phone: {fam.mobile}</p>

                <AntigravityButton
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => router.push(`/hazara/book?familyId=${fam.id}`)}
                >
                  Book for {fam.fullName.split(" ")[0]}
                </AntigravityButton>
              </AppleLiquidCard>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTEXTUAL BILLS TAB ══ */}
      {activeTab === "bills" && (
        <AppleLiquidCard variant="light" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A3B799]/30">
            <h3 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3]">
              Invoices & Billing Receipts for <span className="text-[#556B4B]">{activeFamilyMember.fullName}</span>
            </h3>
            <TelemetryBadge label={`FILTER: ${activeFamilyMember.relationship}`} variant="sage" />
          </div>

          <div className="divide-y divide-[#A3B799]/20 border border-[#A3B799]/30 rounded-2xl overflow-hidden">
            {filteredBills.length === 0 ? (
              <div className="p-8 text-center text-[#556B4B] text-xs">
                No billing receipts found for {activeFamilyMember.fullName}.
              </div>
            ) : (
              filteredBills.map((bill) => (
                <div key={bill.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#1C2618] dark:text-[#F5F7F3]">{bill.treatment}</p>
                    <p className="text-[10px] text-[#556B4B] font-mono">Invoice #{bill.id} • Date: {bill.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[#1C2618] dark:text-[#F5F7F3]">{bill.amount}</p>
                    <TelemetryBadge label={bill.status} variant="sage" />
                  </div>
                </div>
              ))
            )}
          </div>
        </AppleLiquidCard>
      )}

      {/* ══ CONTEXTUAL REPORTS TAB ══ */}
      {activeTab === "reports" && (
        <AppleLiquidCard variant="light" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A3B799]/30">
            <h3 className="text-sm font-bold text-[#1C2618] dark:text-[#F5F7F3]">
              Clinical Reports & X-Rays for <span className="text-[#556B4B]">{activeFamilyMember.fullName}</span>
            </h3>
            <TelemetryBadge label={`FILTER: ${activeFamilyMember.relationship}`} variant="sage" />
          </div>

          <div className="divide-y divide-[#A3B799]/20 border border-[#A3B799]/30 rounded-2xl overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-[#556B4B] text-xs">
                No clinical reports found for {activeFamilyMember.fullName}.
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div key={rep.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#1C2618] dark:text-[#F5F7F3]">{rep.type}</p>
                    <p className="text-[10px] text-[#556B4B] font-mono">Doctor: {rep.doctor} • Date: {rep.date}</p>
                  </div>
                  <AntigravityButton variant="secondary" size="sm">
                    <FileText className="w-3.5 h-3.5" /> Download PDF
                  </AntigravityButton>
                </div>
              ))
            )}
          </div>
        </AppleLiquidCard>
      )}
    </div>
  );
}

export default function PatientAccountPortal() {
  return (
    <ProgressiveLoader skeleton={<PatientAccountSkeleton />}>
      <PatientAccountPortalContent />
    </ProgressiveLoader>
  );
}
