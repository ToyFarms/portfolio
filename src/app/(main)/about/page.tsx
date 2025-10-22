import Gallery from "@/components/gallery";
import Me3 from "@/../public/me3.jpg";
import HrAnimated from "@/components/hr-animated";
import TextReveal from "@/components/text-reveal";
import { ImageItem } from "@/model/Gallery";
import Image from "next/image";
import {
  SiC,
  SiCplusplus,
  SiGithub,
  SiGo,
  SiJavascript,
  SiLinux,
  SiLua,
  SiMongodb,
  SiNextdotjs,
  SiPython,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import Projects from "@/components/projects";
import RevealImage from "@/components/reveal-image";

const size = 80;
const techs = [
  {
    name: "C",
    icon: <SiC size={size} />,
  },
  {
    name: "C++",
    icon: <SiCplusplus size={size} />,
  },
  {
    name: "Python",
    icon: <SiPython size={size} />,
  },
  {
    name: "Golang",
    icon: <SiGo size={size} />,
  },
  {
    name: "Javascript",
    icon: <SiJavascript size={size} />,
  },
  {
    name: "Typescript",
    icon: <SiTypescript size={size} />,
  },
  {
    name: "React",
    icon: <SiReact size={size} />,
  },
  {
    name: "NextJS",
    icon: <SiNextdotjs size={size} />,
  },
  {
    name: "Tailwindcss",
    icon: <SiTailwindcss size={size} />,
  },
  {
    name: "Lua",
    icon: <SiLua size={size} />,
  },
  {
    name: "SQLite",
    icon: <SiSqlite size={size} />,
  },
  {
    name: "MongoDB",
    icon: <SiMongodb size={size} />,
  },
  {
    name: "Github",
    icon: <SiGithub size={size} />,
  },
  {
    name: "Linux",
    icon: <SiLinux size={size} />,
  },
];

async function getImages() {
  const res = await fetch(process.env.URL + "/api/gallery");
  if (!res.ok) {
    throw new Error("Failed to fetch gallery");
  }
  return (await res.json()).images;
}

export default async function AboutPage() {
  let images: ImageItem[] = await getImages();

  return (
    <div>
      <div className="flex flex-row">
        <div className="text-[3rem] leading-none font-[450] indent-12 mb-30 flex-1/2 pr-40">
          <TextReveal>
            I'm a student and likes to{" "}
            <span className="text-primary">code</span>.
          </TextReveal>
          <TextReveal className="ml-24">
            The journey began in 2019 as a hobby as passion with more than{" "}
            <span className="text-primary">
              6 years of experience in various fields.
            </span>
          </TextReveal>
          <br />
          <TextReveal className="ml-24">
            Initially interested in Game Development, but later discovered
            myself passionate in Low Level, Fullstack, and Design. I strive to
            excel at every framework, tools, language i encounter.
          </TextReveal>
        </div>
        <RevealImage
          image={<Image src={Me3} width={0} height={0} alt="me" />}
          className="flex-2"
        />
      </div>

      <div className="mt-30">
        <TextReveal className="text-[3rem] font-[450]" splitBy="char">
          Projects
        </TextReveal>
        <HrAnimated className="mb-10" />
        <Projects />
      </div>

      <div className="mt-30">
        <TextReveal className="text-[3rem] font-[450]" splitBy="char">
          Technologies
        </TextReveal>
        <hr className="mb-10" />
        <ul className="flex flex-row flex-wrap gap-8 text-muted">
          {techs.map((t) => (
            <li
              className="flex-[1_1_calc(20%-1rem)] outline outline-muted flex justify-center py-8"
              key={t.name}
            >
              {t.icon}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-30">
        <TextReveal className="text-[3rem] font-[450]" splitBy="char">
          Gallery
        </TextReveal>
        <HrAnimated className="mb-10" />
        <Gallery images={images} />
      </div>
    </div>
  );
}
