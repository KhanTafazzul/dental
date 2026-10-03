"use client";

import React from "react";

export const AuthSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-16 animate-pulse">
      <div className="rounded-3xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 border border-white/20 p-8 space-y-6">
        <div className="h-8 w-48 mx-auto bg-[#2C3A27]/30 rounded-lg" />
        <div className="h-4 w-64 mx-auto bg-[#2C3A27]/20 rounded" />

        <div className="space-y-4 pt-4">
          <div className="h-12 w-full bg-[#2C3A27]/20 rounded-xl" />
          <div className="h-12 w-full bg-[#2C3A27]/20 rounded-xl" />
          <div className="h-12 w-full bg-[#2C3A27]/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
