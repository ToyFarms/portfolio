"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ResolvedProject } from "@/app/api/project/types";

export default function Projects() {
  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch("/api/project");
      const json: ResolvedProject[] = (await res.json()).projects;

      setProjects(json);
    }
    fetchProjects();
  }, []);

  if (!projects) {
    return <div></div>;
  }

  console.log(projects)

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
      {projects.map((p) => (
        <div
          key={p.title}
          className="inline-block w-full mb-6 break-inside-avoid overflow-hidden bg-white shadow"
          style={{ breakInside: "avoid" }}
        >
          <a className="df" href={p.url || "#"} target="_blank">
            {p.imageResolved && (
              <Image
                src={p.imageResolved.url!}
                width={0}
                height={0}
                className="w-full h-auto object-cover"
                alt={p.imageKey || "?"}
                unoptimized
              />
            )}
          </a>
          <div className="p-4">
            <div className="flex gap-2 flex-wrap">
              {p.technologies.map((t) => (
                <div
                  key={t}
                  className="outline px-3 py-1 text-xs text-gray-500"
                >
                  {t}
                </div>
              ))}
            </div>
            <h2 className="font-bold text-lg mt-4">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
