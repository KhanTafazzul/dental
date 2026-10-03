"use client";

import React from "react";

interface TelemetryBadgeProps {
  label: string;
  variant?: "olive" | "sage" | "paper" | "alert" | "dark";
  code?: string;
  className?: string;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  label,
  variant = "olive",
  code,
  className = "",
}) => {
  const variantClasses = {
    olive: "bg-[#2C3A27] text-[#E2E8DC] border-[#3E5037]",
    sage: "bg-[#6E8662]/20 text-[#2C3A27] dark:text-[#A3B799] border-[#556B4B]/30",
    paper: "bg-[#F5F7F3] text-[#1C2618] border-[#A3B799]/40",
    alert: "bg-[#8B0000]/15 text-[#D93838] border-[#8B0000]/30",
    dark: "bg-[#0F150D] text-[#A3B799] border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono tracking-wider uppercase ${variantClasses[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {code && <span className="opacity-60 font-semibold">[{code}]</span>}
      <span>{label}</span>
    </span>
  );
};
