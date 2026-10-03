import React from "react";
import { getAdminSupabase } from "@/lib/supabase";
import AppointmentsClient from "./AppointmentsClient";
import { AlertCircle } from "lucide-react";
import { TelemetryBadge } from "@/components/ui/TelemetryBadge";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";

export const metadata = {
  title: "Admin Dashboard | Appointments Overview",
  description: "Master list of clinic appointments.",
};

export default async function AdminDashboardPage() {
  const adminDb = getAdminSupabase();
  let appointments: any[] = [];
  let branches: any[] = [];
  let dbConfigured = true;

  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project")
    ) {
      dbConfigured = false;
    } else {
      const [branchRes, apptRes] = await Promise.all([
        adminDb.from("branches").select("id, name, slug"),
        adminDb
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            problem_description,
            status,
            created_at,
            patients (id, name, email, mobile, age),
            doctors (id, name, email, specialty),
            branches (id, name, slug)
          `)
          .order("appointment_date", { ascending: false }),
      ]);

      if (apptRes.error) {
        throw apptRes.error;
      }

      const fetchedBranches = branchRes.data || [];
      const hazaraBranch = fetchedBranches.find((b) => b.slug === "hazara");
      const familyBranch = fetchedBranches.find((b) => b.slug === "family");

      if (hazaraBranch?.name.includes("Store") || familyBranch?.name.includes("Store")) {
        await Promise.all([
          adminDb.from("branches").update({ name: "Hazara Dental Clinic" }).eq("slug", "hazara"),
          adminDb.from("branches").update({ name: "Family Dental Clinic" }).eq("slug", "family"),
        ]);
        const refetch = await adminDb.from("branches").select("id, name, slug");
        branches = refetch.data || [];
      } else {
        branches = fetchedBranches;
      }

      appointments = apptRes.data || [];
    }
  } catch (error) {
    console.error("Error loading dashboard appointments:", error);
  }

  if (!dbConfigured) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white border border-slate-200 rounded-3xl mt-12 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Supabase Configuration Required</h3>
        <p className="text-sm text-slate-600 mb-4">
          Please set your <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and <code>SUPABASE_SERVICE_ROLE_KEY</code> in the <code>.env.local</code> file.
        </p>
      </div>
    );
  }

  return (
    <ProgressiveLoader skeleton={<AdminDashboardSkeleton />}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1C2618] dark:text-[#F5F7F3]">Appointments Overview</h1>
            <p className="text-xs text-[#556B4B]">Master schedule across Hazara & Family branches</p>
          </div>
          <TelemetryBadge label="Clinic HQ" code="ADMIN-V2" variant="olive" />
        </div>

        <AppointmentsClient initialAppointments={appointments} branches={branches} />
      </div>
    </ProgressiveLoader>
  );
}
