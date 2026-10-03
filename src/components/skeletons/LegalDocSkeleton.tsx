"use client";

import React from "react";

export const LegalDocSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
      <div className="h-10 w-72 bg-[#2C3A27]/40 rounded-xl" />
      <div className="h-4 w-48 bg-[#2C3A27]/20 rounded" />
      <div className="space-y-3 pt-6">
        <div className="h-4 w-full bg-[#2C3A27]/20 rounded" />
        <div className="h-4 w-full bg-[#2C3A27]/20 rounded" />
        <div className="h-4 w-3/4 bg-[#2C3A27]/20 rounded" />
      </div>
    </div>
  );
};
