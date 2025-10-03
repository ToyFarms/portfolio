"use client";

import { ImageItem } from "@/model/Gallery";
import { CircleX, ArrowRight, ArrowLeft } from "lucide-react";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: ImageItem[];
};

export default function Gallery({ images = [] }: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);

  const shuffled = useMemo(() => shuffleArray(images || []), [images]);

  useEffect(() => {
    const targetColumnWidth = 220;
    const rowsToShow = 1;

    function recalc() {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const cols = Math.max(1, Math.floor(w / targetColumnWidth));
      const count = Math.max(3, cols * rowsToShow);
      setVisibleCount(count);
    }

    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    else ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const displayed = showAll ? shuffled : shuffled.slice(0, visibleCount);

  function openModalFromDisplayed(indexInDisplayed: number) {
    const img = displayed[indexInDisplayed];
    const globalIndex = shuffled.findIndex((s) => s._id === img._id);
    setModalIndex(globalIndex >= 0 ? globalIndex : 0);
    setModalOpen(true);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!modalOpen) return;
      if (e.key === "Escape") setModalOpen(false);
      if (e.key === "ArrowRight")
        setModalIndex((i) => (i + 1) % shuffled.length);
      if (e.key === "ArrowLeft")
        setModalIndex((i) => (i - 1 + shuffled.length) % shuffled.length);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, shuffled.length]);

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-end mb-4 gap-4">
        <div className="flex gap-2">
          <button onClick={() => setShowAll((s) => !s)}>
            {showAll
              ? "Show less"
              : `Show ${Math.min(visibleCount, shuffled.length)} / ${shuffled.length}`}
          </button>
        </div>
      </div>

      <div
        className="gallery-masonry"
        style={{
          columnWidth: "220px",
          columnGap: "16px",
        }}
      >
        {displayed.map((img, i) => (
          <div key={img._id} className="overflow-hidden break-inside-avoid">
            <button
              onClick={() => openModalFromDisplayed(i)}
              className="outline-none"
              aria-label={`Open ${img.filename || "image"}`}
            >
              <img
                src={img.url}
                alt={img.filename || "gallery image"}
                loading="lazy"
                className="w-full h-auto block object-cover align-top"
                style={{ display: "block" }}
              />
            </button>
          </div>
        ))}
      </div>
      {!showAll && shuffled.length > visibleCount ? (
        <div className="break-inside-avoid flex justify-center my-12">
          <button onClick={() => setShowAll(true)} className="w-[20%] min-h-12">
            Show all ({shuffled.length})
          </button>
        </div>
      ) : (
        <div className="break-inside-avoid flex justify-center my-12">
          <button
            onClick={() => setShowAll(false)}
            className="w-[20%] min-h-12"
          >
            Show less
          </button>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/20"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative max-w-[90vw] max-h-[90vh] w-full">
            <div className="flex items-center gap-2 justify-between mb-2 text-muted">
              <div className="text-sm">
                {modalIndex + 1} / {shuffled.length}
              </div>
              <div className="flex gap-2">
                <button
                  className="outline-none"
                  onClick={() => setModalOpen(false)}
                >
                  <CircleX></CircleX>
                </button>
              </div>
            </div>

            <div
              className="bg-black/20 backdrop-blur-lg rounded-lg overflow-hidden flex items-center justify-center"
              style={{ height: "75vh" }}
            >
              <img
                src={shuffled[modalIndex]?.url}
                alt={shuffled[modalIndex]?.filename || "image"}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <button
                className="outline-none"
                onClick={() =>
                  setModalIndex(
                    (i) => (i - 1 + shuffled.length) % shuffled.length,
                  )
                }
              >
                <ArrowLeft />
              </button>
              <button
                className="outline-none"
                onClick={() => setModalIndex((i) => (i + 1) % shuffled.length)}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Optional: small polish so images don't span full column width when very narrow */
        .gallery-masonry img {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
    </div>
  );
}

// ---- helpers ----
function shuffleArray<T>(arr: T[]): T[] {
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
