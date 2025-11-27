import { connectDB } from "@/lib/mongodb";
import { Project } from "@/model/Project";
import { NextRequest, NextResponse } from "next/server";

async function resolveImageKey(project: any, request: NextRequest) {
  if (!project || !project.imageKey) return { ...project, imageResolved: null };

  try {
    const origin = new URL(request.url).origin;
    const res = await fetch(
      `${origin}/api/gallery/tags/${encodeURIComponent(project.imageKey)}`,
    );
    if (!res.ok) return { ...project, imageResolved: null };
    const data = await res.json();
    return {
      ...project,
      imageResolved: Array.isArray(data?.images)
        ? (data.images[0] ?? null)
        : null,
    };
  } catch (e) {
    return { ...project, imageResolved: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const title = url.searchParams.get("title");

    if (id || title) {
      const query = id ? { _id: id } : { title };
      const proj = await Project.findOne(query).lean();
      if (!proj)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      const resolved = await resolveImageKey(proj, request);
      return NextResponse.json(resolved);
    }

    const projects = await Project.find({}).lean();
    const resolved = await Promise.all(
      projects.map((p) => resolveImageKey(p, request)),
    );
    return NextResponse.json({ projects: resolved });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, id, title, url, description, imageKey, technologies } =
      body || {};

    const payload: any = {};
    if (typeof title !== "undefined") payload.title = title;
    if (typeof url !== "undefined") payload.url = url;
    if (typeof description !== "undefined") payload.description = description;
    if (typeof imageKey !== "undefined") payload.imageKey = imageKey;
    if (typeof technologies !== "undefined")
      payload.technologies = technologies;

    let doc: any = null;

    if (id || _id) {
      doc = await Project.findOneAndUpdate({ _id: id || _id }, payload, {
        new: true,
      });
      if (!doc)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } else if (title) {
      doc = await Project.findOneAndUpdate({ title }, payload, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
    } else {
      const created = new Project(payload);
      await created.save();
      doc = created;
    }

    const resolved = await resolveImageKey(
      doc.toObject ? doc.toObject() : doc,
      request,
    );
    return NextResponse.json(resolved);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    let title = url.searchParams.get("title");

    if (!id && !title) {
      try {
        const body = await request.json();
        id = body?.id ?? body?._id ?? id;
        title = body?.title ?? title;
      } catch (_) {}
    }

    if (!id && !title)
      return NextResponse.json(
        { error: "Provide id or title to delete" },
        { status: 400 },
      );

    const query = id ? { _id: id } : { title };
    const result = await Project.deleteOne(query);
    return NextResponse.json({ deletedCount: result.deletedCount ?? 0 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
