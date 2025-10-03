"use client";

import Me from "@/../public/me.png";
import Me2 from "@/../public/me2.png";
import AnimatedMaskImage from "@/components/animated-mask-image";

export default function HomePage() {
  return (
    <div className="flex flex-row justify-around">
      <div>
        <div className="text-[3rem] leading-none font-[450] indent-12">
          <p>My name is Diandra Shafar Rahman.</p>
          <span>
            I'm a <span className="text-primary">Fullstack Developer</span>{" "}
            based in Indonesia
          </span>
        </div>

        <button className="mt-10 text-[1.3rem] w-fit">
          <a href="mailto:shafarrahman@gmail.com">shafarrahman@gmail.com</a>
        </button>
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
