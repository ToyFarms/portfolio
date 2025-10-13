"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function HrAnimated({
  className = '',
  ...props
}: {
  className?: string;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className={`border border-b-black ${className}`}
      initial={{ width: 0, opacity: 0 }}
      animate={isInView ? { width: "auto", opacity: 1 } : { width: 0, opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
      {...props}
    />
  );
}
