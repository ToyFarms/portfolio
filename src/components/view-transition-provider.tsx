"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { pageVariants, pageTransition } from "@/lib/animations";

interface ViewTransitionProviderProps {
  children: ReactNode;
}

export default function ViewTransitionProvider({
  children,
}: ViewTransitionProviderProps) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
