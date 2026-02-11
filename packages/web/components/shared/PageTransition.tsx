'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  const fadeOnly = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  };

  const fadeWithMotion = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
    transition: { duration: 0.25, ease: 'easeOut' },
  };

  const animation = prefersReducedMotion ? fadeOnly : fadeWithMotion;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        data-pathname={pathname}
        data-reduced-motion={prefersReducedMotion}
        {...animation}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
