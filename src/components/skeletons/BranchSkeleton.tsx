"use client";

import React from "react";

export const BranchSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 space-y-10 animate-pulse">
      <div className="h-80 rounded-3xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 p-8 space-y-4">
        <div className="h-6 w-32 bg-[#2C3A27]/20 rounded" />
        <div className="h-10 w-80 bg-[#2C3A27]/30 rounded-xl" />
        <div className="h-4 w-full max-w-xl bg-[#2C3A27]/20 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-[#E2E8DC]/50 dark:bg-[#1C2618]/50 p-5 space-y-3">
            <div className="h-6 w-1/2 bg-[#2C3A27]/30 rounded" />
            <div className="h-4 w-3/4 bg-[#2C3A27]/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
