"use client";

import React from "react";

export const BookingSuccessSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-[#E2E8DC]/60 dark:bg-[#1C2618]/60 space-y-6 animate-pulse text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#2C3A27]/30 mx-auto" />
      <div className="h-8 w-48 mx-auto bg-[#2C3A27]/40 rounded-lg" />
      <div className="h-4 w-64 mx-auto bg-[#2C3A27]/20 rounded" />
      <div className="h-48 rounded-2xl bg-[#2C3A27]/20 p-4" />
    </div>
  );
};
