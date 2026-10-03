"use client";

import React from "react";

export const DoctorDashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-32 rounded-3xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#2C3A27]/40 rounded-lg" />
          <div className="h-4 w-40 bg-[#2C3A27]/20 rounded" />
        </div>
        <div className="h-10 w-32 bg-[#2C3A27]/30 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-96 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 p-6 space-y-4" />
        <div className="h-96 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 p-6 space-y-4" />
      </div>
    </div>
  );
};
