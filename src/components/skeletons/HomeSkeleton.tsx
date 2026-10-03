"use client";

import React from "react";

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[420px] rounded-3xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 border border-white/20 p-8 flex flex-col justify-between">
        <div className="space-y-4 max-w-xl">
          <div className="h-6 w-32 bg-[#2C3A27]/20 rounded-md" />
          <div className="h-12 w-full bg-[#2C3A27]/30 rounded-xl" />
          <div className="h-12 w-3/4 bg-[#2C3A27]/30 rounded-xl" />
          <div className="h-4 w-1/2 bg-[#2C3A27]/20 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-36 bg-[#2C3A27]/40 rounded-xl" />
          <div className="h-12 w-36 bg-[#2C3A27]/20 rounded-xl" />
        </div>
      </div>

      {/* Grid Branch Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-white/20 p-6 space-y-4">
          <div className="h-8 w-40 bg-[#2C3A27]/30 rounded-lg" />
          <div className="h-4 w-full bg-[#2C3A27]/20 rounded" />
          <div className="h-4 w-2/3 bg-[#2C3A27]/20 rounded" />
        </div>
        <div className="h-64 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 border border-white/20 p-6 space-y-4">
          <div className="h-8 w-40 bg-[#2C3A27]/30 rounded-lg" />
          <div className="h-4 w-full bg-[#2C3A27]/20 rounded" />
          <div className="h-4 w-2/3 bg-[#2C3A27]/20 rounded" />
        </div>
      </div>
    </div>
  );
};
