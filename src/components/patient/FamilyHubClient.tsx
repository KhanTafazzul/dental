"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  ChevronRight,
  Plus,
  Check,
  X,
  Stethoscope,
  Smile,
  Activity,
  AlertCircle,
  Baby,
  User,
  HeartPulse,
} from "lucide-react";
import DentalLogo from "@/components/DentalLogo";
import {
  FamilyMember,
  calculateAgeFromDob,
  getStoredFamilyMembers,
  saveStoredFamilyMember,
} from "@/lib/family";

export default function FamilyHubClient() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("self");
  const [showAddModal, setShowAddModal] = useState(false);

  // New member form states
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newRelation, setNewRelation] = useState<'Son' | 'Daughter' | 'Wife' | 'Husband' | 'Father' | 'Mother' | 'Sibling' | 'Other'>('Daughter');
  const [newGender, setNewGender] = useState<"Male" | "Female" | "Other">("Female");
  const [newPhone, setNewPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("falix_patient_user");
      let userId = "guest_user";
      let selfName = "Aman Khan";
      let selfMobile = "+91 98200 12345";
      let selfEmail = "patient@example.com";
      let selfDob = "1995-05-15";

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          userId = parsed.uid || parsed.id || "guest_user";
          selfName = parsed.fullName || "Self";
          selfMobile = parsed.mobile || "";
          selfEmail = parsed.email || "";
          selfDob = parsed.dob || "1995-05-15";
        } catch {}
      }

      const stored = getStoredFamilyMembers(userId);
      const selfMember: FamilyMember = {
        id: "self",
        userId,
        fullName: selfName,
        dob: selfDob,
        relationship: "Self",
        gender: "Male",
        mobile: selfMobile,
        email: selfEmail,
      };

      const combined = [selfMember, ...stored.filter((m) => m.id !== "self")];
      setFamilyMembers(combined);
    }
  }, []);

  const selectedMember = familyMembers.find((m) => m.id === selectedMemberId) || familyMembers[0];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDob) {
      setFormError("Please enter full name and date of birth.");
      return;
    }

    const savedUser = typeof window !== "undefined" ? localStorage.getItem("falix_patient_user") : null;
    let userId = "guest_user";
    if (savedUser) {
      try {
        userId = JSON.parse(savedUser).uid || "guest_user";
      } catch {}
    }

    const newMember: FamilyMember = {
      id: "fam_" + Date.now(),
      userId,
      fullName: newName.trim(),
      dob: newDob,
      relationship: newRelation,
      gender: newGender,
      mobile: newPhone.trim(),
      email: "",
    };

    saveStoredFamilyMember(userId, newMember);

    const updatedList = [...familyMembers, newMember];
    setFamilyMembers(updatedList);
    setSelectedMemberId(newMember.id);

    // Reset Form
    setNewName("");
    setNewDob("");
    setNewPhone("");
    setFormError(null);
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen w-full max-w-full font-ui bg-[#FDFBF7] dark:bg-[#0F150D] text-[#2C3325] dark:text-[#F5F7F3] overflow-x-hidden transition-colors">
      
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/85 dark:bg-[#0F150D]/85 backdrop-blur-xl border-b border-[#4A5D23]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Family Dental Care">
            <div className="p-1.5 rounded-xl bg-[#4A5D23]/10 dark:bg-white/10">
              <DentalLogo size={28} />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold font-display tracking-tight text-[#2C3325] dark:text-white block">
                Family Health Hub
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#556B4B] dark:text-[#A3B799]">
                Multi-Generational Oral Care
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 sm:px-4 py-2 text-xs font-bold font-display text-[#4A5D23] dark:text-[#88B04B] bg-[#E4E7D3] dark:bg-[#1C2618] hover:bg-[#4A5D23] hover:text-white rounded-2xl transition border border-[#4A5D23]/20 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Member</span>
            </button>
            <Link
              href="/family/book"
              className="px-4 sm:px-5 py-2 text-xs font-bold font-display text-white bg-[#4A5D23] hover:bg-[#3D4C1D] rounded-2xl transition shadow-md shadow-[#4A5D23]/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Visit</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ MAIN HUB CONTENT ═══ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        
        {/* Hero Spotlight */}
        <div className="p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-[#2C3325] via-[#3A4927] to-[#1C2618] text-white relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#88B04B]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E4E7D3]">
              <Sparkles className="w-3.5 h-3.5 text-[#88B04B]" />
              Unified Family Dental Record
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white leading-tight">
              One account for your entire family’s smiles.
            </h1>
            <p className="text-xs sm:text-sm text-[#E4E7D3]/85 leading-relaxed font-light">
              Manage pediatric checkups for children, orthodontic adjustments for teens, and restorative crown care for grandparents under a single clinical profile.
            </p>
          </div>
        </div>

        {/* ═══ CIRCULAR FAMILY MEMBER SELECTOR BAR ═══ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold font-display text-[#2C3325] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4A5D23]" /> Family Members ({familyMembers.length})
              </h2>
              <p className="text-xs text-[#556B4B] dark:text-[#A3B799]">
                Click any circular profile to inspect their dental records or schedule an appointment.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-[#4A5D23] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add New Family Member
            </button>
          </div>

          {/* Circular Button Horizontal Switcher */}
          <div className="flex flex-wrap gap-3 sm:gap-4 p-4 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-sm">
            {familyMembers.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const initials = member.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`flex items-center gap-3 p-2.5 pr-5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#4A5D23] text-white border-[#4A5D23] shadow-lg shadow-[#4A5D23]/25"
                      : "bg-[#F0F2EB] dark:bg-[#141F16] text-[#2C3325] dark:text-[#E2E8DC] border-[#4A5D23]/15 hover:border-[#4A5D23]"
                  }`}
                >
                  {/* Circular Avatar */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold font-display text-sm shrink-0 transition ${
                      isSelected ? "bg-white text-[#4A5D23] shadow-md" : "bg-[#4A5D23] text-white"
                    }`}
                  >
                    {initials || "F"}
                  </div>

                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>{member.fullName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-[#556B4B] dark:text-[#A3B799]"}`}>
                      {member.relationship} • Age {calculateAgeFromDob(member.dob)}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ═══ SELECTED MEMBER CLINICAL PASSPORT CARD ═══ */}
        {selectedMember && (
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/15 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#4A5D23]/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#4A5D23] to-[#2C3325] text-white flex items-center justify-center text-xl font-bold font-display shadow-md">
                  {selectedMember.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-display text-[#2C3325] dark:text-white">
                      {selectedMember.fullName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E4E7D3] dark:bg-[#2C3A27] text-[#4A5D23] dark:text-[#88B04B] font-bold text-[10px]">
                      {selectedMember.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-[#556B4B] dark:text-[#A3B799] mt-0.5">
                    Date of Birth: {selectedMember.dob} (Age {calculateAgeFromDob(selectedMember.dob)})
                  </p>
                </div>
              </div>

              <Link
                href={`/family/book?familyId=${selectedMember.id}`}
                className="px-6 py-3.5 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4A5D23]/20 shrink-0"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment for {selectedMember.fullName.split(" ")[0]}</span>
              </Link>
            </div>

            {/* Medical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#F0F2EB] dark:bg-[#141F16] border border-[#4A5D23]/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#556B4B] block flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-[#4A5D23]" /> Dental Hygiene Status
                </span>
                <div className="text-sm font-bold text-[#2C3325] dark:text-white">Healthy & Routine</div>
                <div className="text-[11px] text-[#556B4B]">Recommended cleaning every 6 months.</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F2EB] dark:bg-[#141F16] border border-[#4A5D23]/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#556B4B] block flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-[#4A5D23]" /> Contact / Reminders
                </span>
                <div className="text-sm font-bold text-[#2C3325] dark:text-white">
                  {selectedMember.mobile || "Parent Mobile Linked"}
                </div>
                <div className="text-[11px] text-[#556B4B]">WhatsApp appointment alerts active.</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F2EB] dark:bg-[#141F16] border border-[#4A5D23]/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#556B4B] block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D23]" /> DPDP Protected Data
                </span>
                <div className="text-sm font-bold text-[#2C3325] dark:text-white">Encrypted Vault</div>
                <div className="text-[11px] text-[#556B4B]">Under Parental/Guardian consent.</div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ═══ ADD FAMILY MEMBER SLIDING MODAL ═══ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C2618] border border-[#4A5D23]/20 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#4A5D23]/15">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#4A5D23]/10 text-[#4A5D23]">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-[#2C3325] dark:text-white">
                      Add Family Member
                    </h3>
                    <p className="text-xs text-[#556B4B]">Register a child, spouse, or parent</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#556B4B]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Zaid Khan"
                    className="w-full px-4 py-3 rounded-2xl premium-input text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#556B4B]">Relationship</label>
                    <select
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-2xl premium-input text-xs font-medium cursor-pointer"
                    >
                      <option value="Daughter">Daughter</option>
                      <option value="Son">Son</option>
                      <option value="Wife">Wife</option>
                      <option value="Husband">Husband</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other Family</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#556B4B]">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={newDob}
                      onChange={(e) => setNewDob(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl premium-input text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#556B4B]">
                    Mobile Phone (Optional - leaves defaults to main account)
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 9820012345"
                    className="w-full px-4 py-3 rounded-2xl premium-input text-xs font-mono font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3.5 rounded-2xl border border-[#4A5D23]/20 font-display font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-display font-semibold text-xs transition shadow-md cursor-pointer"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#4A5D23]/15 py-8 px-4 sm:px-6 text-xs text-[#556B4B] dark:text-[#A3B799] bg-[#FDFBF7] dark:bg-[#0F150D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Family Dental Care • Dedicated Family Dental Health Hub</p>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/terms" className="hover:text-[#2C3325] dark:hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-[#2C3325] dark:hover:text-white">Privacy</Link>
            <Link href="/dpdp" className="hover:text-[#2C3325] dark:hover:text-white">DPDP Rights</Link>
            <Link href="/family/book" className="hover:text-[#4A5D23]">Family Booking</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
