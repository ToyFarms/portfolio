import { projects, ProjectType } from "@/lib/dataSource";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/model/Project";
import { NextRequest, NextResponse } from "next/server";

export async function saveProject(
  project: ProjectType,
  opts?: { id?: string; signal?: AbortSignal },
): Promise<any> {
  const payload: Record<string, unknown> = { ...project };
  if (opts?.id) payload._id = opts.id;

  const p = new Project(payload);
  await p.save();
}

export async function GET(_req: NextRequest) {
  await connectDB();
  projects.forEach(async (project) => await saveProject(project));
  return NextResponse.json({});
}
