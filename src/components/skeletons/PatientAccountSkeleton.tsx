"use client";

import React from "react";

export const PatientAccountSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 border border-white/20">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#2C3A27]/30 rounded-lg" />
          <div className="h-4 w-32 bg-[#2C3A27]/20 rounded" />
        </div>
        <div className="h-10 w-44 bg-[#2C3A27]/30 rounded-xl" />
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <div className="h-10 w-28 bg-[#2C3A27]/30 rounded-xl shrink-0" />
        <div className="h-10 w-28 bg-[#2C3A27]/20 rounded-xl shrink-0" />
        <div className="h-10 w-28 bg-[#2C3A27]/20 rounded-xl shrink-0" />
        <div className="h-10 w-28 bg-[#2C3A27]/20 rounded-xl shrink-0" />
      </div>

      {/* Cards List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-48 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-white/20 p-5 space-y-3">
          <div className="h-6 w-3/4 bg-[#2C3A27]/30 rounded" />
          <div className="h-4 w-1/2 bg-[#2C3A27]/20 rounded" />
          <div className="h-10 w-full bg-[#2C3A27]/20 rounded-xl mt-4" />
        </div>
        <div className="h-48 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-white/20 p-5 space-y-3">
          <div className="h-6 w-3/4 bg-[#2C3A27]/30 rounded" />
          <div className="h-4 w-1/2 bg-[#2C3A27]/20 rounded" />
          <div className="h-10 w-full bg-[#2C3A27]/20 rounded-xl mt-4" />
        </div>
        <div className="h-48 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-white/20 p-5 space-y-3">
          <div className="h-6 w-3/4 bg-[#2C3A27]/30 rounded" />
          <div className="h-4 w-1/2 bg-[#2C3A27]/20 rounded" />
          <div className="h-10 w-full bg-[#2C3A27]/20 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
};
