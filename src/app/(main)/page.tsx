"use client";

import Me from "@/../public/me.png";
import Me2 from "@/../public/me2.png";
import DecryptedText from "@/components/text-decrypt";
import TextReveal from "@/components/text-reveal";
import Timeline from "@/components/timeline";
import { socials, timelineObjects } from "@/lib/dataSource";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const AnimatedMaskImage = dynamic(
  () => import("@/components/animated-mask-image"),
  { ssr: false },
);

export default function HomePage() {
  return (
    <div className="flex flex-row justify-around">
      <div>
        <div className="text-[3rem] indent-12 leading-none font-[450]">
          <TextReveal>
            My name is Diandra Shafar Rahman.
            <br />
            I'm a <span className="text-primary">Fullstack Developer</span>{" "}
            based in Indonesia
          </TextReveal>
        </div>

        <div className="flex gap-5">
          {socials.map((s, i) => (
            <motion.a
              key={s.name}
              href={s.href}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 2,
                delay: 0.1 * i,
                type: "tween",
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <DecryptedText
                className="lowercase"
                text={s.display}
                animateOn="view"
                sequential
                speed={100}
              />
            </motion.a>
          ))}
        </div>

        <Timeline objects={timelineObjects} className="mt-30" />
      </div>

      <AnimatedMaskImage
        src={Me}
        src2={Me2}
        minWidth={10}
        maxWidth={300}
        minHeight={10}
        maxHeight={300}
        rectCount={30}
        speed={2}
        className="rounded-xl shadow-lg w-[500px] mt-8"
      />
    </div>
  );
}
