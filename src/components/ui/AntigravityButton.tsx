"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AntigravityButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export const AntigravityButton: React.FC<AntigravityButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E8662] active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4.5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#2C3A27] hover:bg-[#3E5037] text-[#F5F7F3] shadow-lg shadow-[#1C2618]/25 border border-white/20",
    secondary:
      "bg-[#E2E8DC] hover:bg-[#D4DDD0] text-[#1C2618] dark:bg-[#2C3A27]/60 dark:hover:bg-[#2C3A27] dark:text-[#E2E8DC] border border-black/5 dark:border-white/10",
    outline:
      "bg-transparent border-2 border-[#2C3A27] text-[#2C3A27] hover:bg-[#2C3A27] hover:text-[#F5F7F3] dark:border-[#A3B799] dark:text-[#A3B799] dark:hover:bg-[#A3B799] dark:hover:text-[#0F150D]",
    ghost:
      "bg-transparent text-[#2C3A27] hover:bg-[#2C3A27]/10 dark:text-[#E2E8DC] dark:hover:bg-white/10",
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
