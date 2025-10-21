"use client";

import { motion } from "framer-motion";

export default function RevealImage({
  className,
  image,
}: {
  className: string;
  image: React.ReactNode;
}) {
  const partial = 10;
  const clipStart = `polygon(0% 0%, 0% 0%, 0% ${partial}%, 0% ${partial}%)`;
  const clipMid = `polygon(0% 0%, 100% 0%, 100% ${partial}%, 0% ${partial}%)`;
  const clipFull = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`;

  return (
    <motion.div
      className={`flex-2 ${className}`}
      initial={{ clipPath: clipStart, opacity: 0 }}
      animate={{
        clipPath: [clipStart, clipMid, clipFull],
        opacity: [0, 1, 1],
      }}
      transition={{
        duration: 2.5,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.7, 1],
        delay: 0.3,
      }}
    >
      {image}
    </motion.div>
  );
}
