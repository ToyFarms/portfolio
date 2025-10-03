"use client";

import { ImageItem } from "@/model/Gallery";
import React, { useEffect, useRef, useState } from "react";

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return Math.round(bytes / (1024 * 1024)) + " MB";
}

export default function DashboardPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [editTags, setEditTags] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [fileNamePreview, setFileNamePreview] = useState<string | null>(null);
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setImages(data.images);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e?: React.FormEvent) {
    e?.preventDefault();
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setMessage("Pick at least one file.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }

      const res = await fetch("/api/gallery", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      setMessage("Upload successful");
      await fetchImages();

      if (fileRef.current) {
        fileRef.current.value = "";
      }
      setFileNamePreview(null);
      setSelectedFilesCount(0);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleAddByUrl(url: string) {
    if (!url) {
      setMessage("Please provide a URL.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setMessage("Invalid URL.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Add by URL failed");
      setMessage("Image added from URL");
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage("Add by URL failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete image?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setImages((prev) => prev.filter((i) => i._id !== id));
      setMessage("Deleted");
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    }
  }

  function openEdit(img: ImageItem) {
    setSelected(img);
    setEditTags(img.tags || "");
  }

  async function saveEdit() {
    if (!selected) return;
    try {
      const res = await fetch(`/api/gallery/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: editTags }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSelected(null);
      setMessage("Saved");
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage("Save failed");
    }
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
    return `${files.length} files (${formatBytes(total)})${files.length > 3 ? ` — ${namesPart}, ...` : ` — ${namesPart}`}`;
  }

  return (
    <div className="max-w-[80%] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.5rem] font-[450]">Gallery Dashboard</h1>
        <div className="text-sm text-gray-500">{images.length} images</div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form
            onSubmit={handleUpload}
            className="flex items-center gap-3"
            aria-label="Upload image form"
          >
            <label className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const f = e.currentTarget.files;
                  setFileNamePreview(buildPreview(f));
                  setSelectedFilesCount(f ? f.length : 0);
                }}
              />
              <div className="cursor-pointer rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:bg-gray-50">
                {fileNamePreview ? (
                  <div className="truncate">{fileNamePreview}</div>
                ) : (
                  <div>Choose file(s)…</div>
                )}
              </div>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 rounded-md text-sm hover:text-gray-500 outline disabled:opacity-50 truncate whitespace-nowrap"
              >
                {uploading
                  ? "Uploading..."
                  : `Upload${selectedFilesCount ? ` (${selectedFilesCount})` : ""}`}
              </button>
            </div>
          </form>

          <UrlAdder onAdd={handleAddByUrl} disabled={uploading} />
        </div>
      </div>

      <button onClick={() => fetchImages()} className="text-sm">
        Refresh
      </button>
      <hr className="mt-2 pb-5 outline-red-500" />

      {message && (
        <div
          className="mb-4 p-3 rounded-md text-sm bg-gray-50 border border-gray-200 flex justify-between items-center"
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
          <div className="text-center py-16 text-gray-500">Loading images…</div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No images</div>
        ) : (
          <div className="flex flex-row flex-wrap gap-8 items-end">
            {images.map((img) => (
              <article
                key={img._id}
                className="bg-white overflow-hidden border flex-[1_1_calc(20%-1rem)]"
              >
                <div className="h-44 bg-gray-100 flex items-center justify-center">
                  <img
                    src={img.url ? img.url : `/api/gallery/${img._id}`}
                    alt={img.filename}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-sm font-medium truncate">
                      {img.filename}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatBytes(img.size)}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-700 min-h-[2.25rem]">
                    {img.tags ? (
                      <div className="truncate">{img.tags}</div>
                    ) : (
                      <div className="text-gray-400">No tags</div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(img)}
                      className="flex-1 px-2 py-1 text-sm rounded-md border outline-none hover:shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(img._id)}
                      className="px-2 py-1 text-sm rounded-md border text-red-600 outline-none hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-lg w-[600px] max-w-full p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Edit {selected.filename}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 text-sm"
              >
                Close
              </button>
            </div>

            <textarea
              rows={6}
              className="w-full mt-3 p-2 border rounded-md text-sm"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-3 py-1 rounded-md border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-3 py-1 rounded-md bg-sky-600 text-white"
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

function UrlAdder({
  onAdd,
  disabled,
}: {
  onAdd: (url: string) => void;
  disabled?: boolean;
}) {
  const [val, setVal] = useState("");
  const [adding, setAdding] = useState(false);

  async function doAdd() {
    if (!val) return;
    setAdding(true);
    try {
      await onAdd(val);
      setVal("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="flex-1 border rounded-md p-2 text-sm"
        aria-label="Image URL"
      />
      <button
        type="button"
        onClick={doAdd}
        disabled={disabled || adding}
        className="px-4 py-2 rounded-md text-sm hover:text-gray-500 outline disabled:opacity-50"
      >
        {adding ? "Adding…" : "Add by URL"}
      </button>
    </div>
  );
}
