"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Jeda animasi (detik) untuk efek bertingkat. */
  delay?: number;
  /** true = animasi langsung saat mount (dipakai di hero, bukan menunggu scroll). */
  immediate?: boolean;
}

const OFFSET = 18;

export function Reveal({ children, className, delay = 0, immediate = false }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // Hormati preferensi aksesibilitas: tanpa animasi sama sekali.
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const transition = { duration: 0.5, delay, ease: "easeOut" } as const;

  if (immediate) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: OFFSET }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
