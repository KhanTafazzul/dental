"use client";

import React from "react";

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-pulse p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-[#2C3A27]/30 rounded-lg" />
          <div className="h-4 w-36 bg-[#2C3A27]/20 rounded" />
        </div>
        <div className="h-10 w-32 bg-[#2C3A27]/30 rounded-xl" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 border border-white/20 p-5 space-y-3"
          >
            <div className="h-4 w-24 bg-[#2C3A27]/30 rounded" />
            <div className="h-8 w-32 bg-[#2C3A27]/40 rounded-lg" />
            <div className="h-3 w-16 bg-[#2C3A27]/20 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Visualizer Skeleton */}
      <div className="h-96 rounded-3xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-white/20 p-6 space-y-4">
        <div className="h-6 w-48 bg-[#2C3A27]/30 rounded" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-10 w-full bg-[#2C3A27]/20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
