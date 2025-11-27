import { ResolvedProject } from "@/app/api/project/types";
import { formatBytes } from "@/lib/utils";
import { EditIcon, TrashIcon, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function ProjectsDashboard() {
  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [editing, setEditing] = useState<ResolvedProject | null>(null);
  const [title, setTitle] = useState("");
  const [projUrl, setProjUrl] = useState("");
  const [description, setDescription] = useState("");
  const [imageKey, setImageKey] = useState("");
  const [techs, setTechs] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/project");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      const list = Array.isArray(data.projects)
        ? data.projects
        : (data.projects ?? []);
      setProjects(list);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setTitle("");
    setProjUrl("");
    setDescription("");
    setImageKey("");
    setTechs("");
    setImageUrlInput("");
    setFilePreview(null);
    setSelectedFilesCount(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openEdit(p: ResolvedProject) {
    setEditing(p);
    setTitle(p.title ?? "");
    setProjUrl(p.url ?? "");
    setDescription(p.description ?? "");
    setImageKey(p.imageKey ?? "");
    setTechs((p.technologies || []).join(", "));
    setFilePreview(null);
    setImageUrlInput("");
    setSelectedFilesCount(0);
  }

  function buildPreview(files: FileList | null) {
    if (!files || files.length === 0) return null;
    if (files.length === 1) {
      const f = files[0];
      return `${f.name} • ${formatBytes(f.size)}`;
    }
    let total = 0;
    const names: string[] = [];
    for (let i = 0; i < files.length; i++) {
      total += files[i].size;
      if (i < 3) names.push(files[i].name);
    }
    const namesPart = names.join(", ");
    return `${files.length} files (${formatBytes(total)})${
      files.length > 3 ? ` — ${namesPart}, ...` : ` — ${namesPart}`
    }`;
  }

  async function uploadImageToGallery(opts: {
    file?: File | null;
    url?: string | null;
    key: string;
  }): Promise<boolean> {
    if (!opts.key) {
      setMessage("Provide an image key (identifier) for the project image.");
      return false;
    }

    const tags = `project,${opts.key}`;

    try {
      if (opts.file) {
        const fd = new FormData();
        fd.append("files", opts.file);
        fd.append("tags", tags);
        const res = await fetch("/api/gallery", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          console.error("gallery upload failed", await res.text());
          throw new Error("Gallery upload failed");
        }
        return true;
      } else if (opts.url) {
        const payload: any = { url: opts.url, tags };
        const filename = opts.url.split("/").pop();
        if (filename) payload.filename = filename;
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error("gallery remote upload failed", await res.text());
          throw new Error("Gallery remote upload failed");
        }
        return true;
      } else {
        setMessage("No image file or URL provided for library upload.");
        return false;
      }
    } catch (err) {
      console.error(err);
      setMessage("Image upload to library failed");
      return false;
    }
  }

  async function handleSaveProject(e?: React.FormEvent) {
    e?.preventDefault();

    if (!title?.trim()) {
      setMessage("Title is required");
      return;
    }

    if (!imageKey?.trim()) {
      setMessage(
        "Image key is required (used to tag the uploaded image in the library).",
      );
      return;
    }
    const file = fileRef.current?.files?.[0] ?? null;
    const url = imageUrlInput?.trim() || null;
    if (!file && !url && !editing?.imageKey) {
      setMessage(
        "Please provide an image (file or URL) or keep the existing project's image key.",
      );
      return;
    }

    setSaving(true);
    try {
      if (file || url) {
        const ok = await uploadImageToGallery({
          file,
          url,
          key: imageKey.trim(),
        });
        if (!ok) {
          setSaving(false);
          return;
        }
      }

      const payload: any = {
        title: title.trim(),
        url: projUrl?.trim() || null,
        description: description?.trim() || null,
        imageKey: imageKey?.trim() || null,
        technologies: techs
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing && editing._id) payload._id = editing._id;

      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("project save failed", await res.text());
        throw new Error("Failed to save project");
      }

      setMessage(editing ? "Project updated" : "Project created");
      await fetchProjects();
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete project?")) return;
    try {
      const res = await fetch(`/api/project?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setMessage("Deleted");
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    }
  }

  return (
    <div className="max-w-[80%] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.5rem] font-[450]">Projects Dashboard</h1>
        <div className="text-sm text-gray-500">{projects.length} projects</div>
      </div>

      <div className="bg-white shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-4">
          <form
            onSubmit={handleSaveProject}
            className="flex flex-col gap-3"
            aria-label="Project form"
          >
            <div className="flex gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                className="flex-1 border p-2 text-sm"
                aria-label="Project title"
              />
              <input
                value={projUrl}
                onChange={(e) => setProjUrl(e.target.value)}
                placeholder="Project site (optional)"
                className="flex-1 border p-2 text-sm"
                aria-label="Project URL"
              />
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full p-2 border text-sm"
            />

            <div className="flex gap-3">
              <input
                value={imageKey}
                onChange={(e) => setImageKey(e.target.value)}
                placeholder="Image key"
                className="flex-1 border p-2 text-sm"
                aria-label="Image key"
              />
              <input
                value={techs}
                onChange={(e) => setTechs(e.target.value)}
                placeholder="Technologies (comma separated)"
                className="flex-1 border p-2 text-sm"
                aria-label="Technologies"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.currentTarget.files;
                    setFilePreview(buildPreview(f));
                    setSelectedFilesCount(f ? f.length : 0);
                  }}
                />
                <div className="cursor-pointer border border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:bg-gray-50">
                  {filePreview ? (
                    <div className="truncate">{filePreview}</div>
                  ) : (
                    <div>Choose image file…</div>
                  )}
                </div>
              </label>

              <div className="flex-1">
                <input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or provide an image URL"
                  className="w-full border p-2 text-sm"
                  aria-label="Image URL for project"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm hover:text-gray-500 outline disabled:opacity-50 truncate whitespace-nowrap"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Create project"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 border text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={() => fetchProjects()} className="text-sm">
          Refresh
        </button>
      </div>

      <hr className="mt-2 pb-5 outline-red-500" />

      {message && (
        <div
          className="mb-4 p-3 text-sm bg-gray-50 border border-gray-200 flex justify-between items-center"
          role="status"
        >
          <div>{message}</div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs text-gray-500 underline outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      <section>
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No projects</div>
        ) : (
          <div className="flex flex-row flex-wrap gap-8 items-start">
            {projects.map((p) => (
              <article
                key={(p._id as any).toString()}
                className="bg-white overflow-hidden border flex-[1_1_calc(20%-1rem)]"
              >
                <div className="h-44 bg-gray-100 flex items-center justify-center">
                  {p.imageResolved && (
                    <img
                      src={p.imageResolved.url!}
                      alt={p.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-sm font-medium truncate">
                      {p.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {p.imageResolved?.size
                        ? formatBytes(p.imageResolved.size)
                        : ""}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-700 min-h-[2.25rem]">
                    {p.description ? (
                      <div className="truncate">{p.description}</div>
                    ) : (
                      <div className="text-gray-400">No description</div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {p.technologies && p.technologies.length ? (
                      p.technologies.join(", ")
                    ) : (
                      <span className="text-gray-400">No technologies</span>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="px-2 py-1 text-sm border outline-none hover:shadow-sm"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete((p._id as any).toString())}
                      className="px-2 py-1 text-sm border text-red-600 outline-none hover:bg-red-50"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white shadow-lg w-[700px] max-w-full p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit {editing.title}</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-gray-500 text-sm"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 text-sm"
              />
              <input
                value={projUrl}
                onChange={(e) => setProjUrl(e.target.value)}
                className="border p-2 text-sm"
              />
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 text-sm"
              />
              <input
                value={imageKey}
                onChange={(e) => setImageKey(e.target.value)}
                className="border p-2 text-sm"
              />
              <input
                value={techs}
                onChange={(e) => setTechs(e.target.value)}
                className="border p-2 text-sm"
              />
              <div className="flex gap-3 items-center">
                <label className="flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.currentTarget.files;
                      setFilePreview(buildPreview(f));
                      setSelectedFilesCount(f ? f.length : 0);
                    }}
                  />
                  <div className="cursor-pointer outline outline-dashed outline-gray-300 p-3 text-sm text-gray-600 hover:bg-gray-50">
                    {filePreview ? (
                      <div className="truncate">{filePreview}</div>
                    ) : (
                      <div>Choose image file…</div>
                    )}
                  </div>
                </label>

                <input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or image URL"
                  className="flex-1 border p-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  resetForm();
                }}
                className="px-3 py-1 border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) =>
                  handleSaveProject(e as unknown as React.FormEvent)
                }
                className="px-3 py-1 bg-sky-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
