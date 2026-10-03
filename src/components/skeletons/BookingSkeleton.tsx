"use client";

import React from "react";

export const BookingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="h-8 w-64 mx-auto bg-[#2C3A27]/30 rounded-lg" />
        <div className="h-4 w-96 mx-auto bg-[#2C3A27]/20 rounded" />
      </div>

      {/* Form Container */}
      <div className="rounded-3xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 border border-white/20 p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#2C3A27]/30 rounded" />
          <div className="h-12 w-full bg-[#2C3A27]/20 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#2C3A27]/30 rounded" />
          <div className="h-12 w-full bg-[#2C3A27]/20 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-[#2C3A27]/20 rounded-xl" />
          <div className="h-12 bg-[#2C3A27]/20 rounded-xl" />
          <div className="h-12 bg-[#2C3A27]/20 rounded-xl" />
        </div>
        <div className="h-14 w-full bg-[#2C3A27]/40 rounded-xl mt-6" />
      </div>
    </div>
  );
};
