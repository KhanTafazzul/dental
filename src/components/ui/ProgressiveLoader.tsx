"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressiveLoaderProps {
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delayMs?: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  skeleton,
  children,
  delayMs = 120,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <AnimatePresence mode="wait">
      {!isReady ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="w-full min-h-[60vh]"
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
