"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AppleLiquidCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "olive";
  hoverEffect?: boolean;
}

export const AppleLiquidCard: React.FC<AppleLiquidCardProps> = ({
  children,
  className = "",
  variant = "light",
  hoverEffect = true,
  ...props
}) => {
  const variantStyles = {
    light:
      "bg-[#F5F7F3]/75 dark:bg-[#1C2618]/85 text-[#1C2618] dark:text-[#E2E8DC] border-white/60 dark:border-white/10 shadow-xl shadow-black/5",
    dark:
      "bg-[#1C2618]/90 text-[#E2E8DC] border-white/15 shadow-2xl shadow-black/40",
    olive:
      "bg-[#2C3A27]/85 text-[#F5F7F3] border-white/20 shadow-xl shadow-[#1C2618]/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverEffect ? { y: -4, scale: 1.005 } : undefined}
      whileTap={hoverEffect ? { scale: 0.98 } : undefined}
      className={`relative overflow-hidden backdrop-blur-2xl rounded-2xl border ${variantStyles[variant]} ${
        hoverEffect ? "transition-shadow duration-300" : ""
      } ${className}`}
      {...props}
    >
      {/* Specular Edge Highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30 dark:ring-white/10" />
      {/* Liquid Reflection Overlay */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 bg-white/10 dark:bg-white/5 rounded-full blur-2xl" />
      {children}
    </motion.div>
  );
};
