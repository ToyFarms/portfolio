import * as i from "lucide-react";
import {
  SiC,
  SiCplusplus,
  SiGithub,
  SiGo,
  SiJavascript,
  SiLinux,
  SiLua,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiPython,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

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

export default function AboutPage() {
  return (
    <div>
      <hr className="pb-10" />
      <div className="text-[3rem] leading-none font-[450] indent-12 mb-30">
        <p>
          I'm a student and likes to <span className="text-primary">code</span>.
        </p>
        <span>
          The journey began in 2019 as a hobby as passion with more than{" "}
          <span className="text-primary">
            6 years of experience in various fields.
          </span>
        </span>
      </div>
      <h2 className="text-[3rem] font-[450]">Technologies</h2>
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
  );
}
