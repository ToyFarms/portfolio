"use client";

import { motion } from "framer-motion";
import { Session } from "next-auth";
import { ProfileClient } from "./profile-client";
import HrAnimated from "./hr-animated";

interface Link {
  name: string;
  href: string;
}

export default function HeaderClient({
  session,
  links,
  socials,
}: {
  session: Session | null;
  links: Link[];
  socials: Link[];
}) {
  const contStyle = "flex flex-col";
  const labelStyle = "text-gray-500 text-[0.7rem] leading-none";
  const pStyle = "text-[1rem] uppercase font-[450]";

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="mb-12">
      <motion.div
        className="flex justify-between mb-7"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className={contStyle}>
          <p className={labelStyle}>Name</p>
          <p className={pStyle}>Diandra Shafar Rahman</p>
        </motion.div>
        <motion.div variants={itemVariants} className={contStyle}>
          <p className={labelStyle}>Status</p>
          <p className={pStyle}>Student</p>
        </motion.div>
        <motion.div variants={itemVariants} className={contStyle}>
          <p className={labelStyle}>Navigation</p>
          <ol className="flex max-w-64 flex-wrap gap-x-1">
            {links.map((l, i) => (
              <li key={l.name}>
                <a className={pStyle} href={l.href}>
                  {l.name}
                </a>
                <span>{i !== links.length - 1 && ","}</span>
              </li>
            ))}
          </ol>
        </motion.div>
        <motion.div variants={itemVariants} className={contStyle}>
          <p className={labelStyle}>My Social</p>
          <ol className="flex max-w-64 flex-wrap gap-x-1">
            {socials.map((l, i) => (
              <li key={l.name}>
                <a className={pStyle} href={l.href} target="_blank">
                  {l.name}
                </a>
                <span>{i !== socials.length - 1 && ", "}</span>
              </li>
            ))}
          </ol>
        </motion.div>
        <motion.div variants={itemVariants} className={contStyle}>
          <p className={labelStyle}>Profile</p>
          <ProfileClient session={session} />
        </motion.div>
      </motion.div>
      <HrAnimated />
    </div>
  );
}
