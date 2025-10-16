"use client";

import { ImageItem } from "@/model/Gallery";
import { CircleX, ArrowRight, ArrowLeft, Filter } from "lucide-react";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

type Props = {
  images: ImageItem[];
};

export default function Gallery({ images = [] }: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const unique = useMemo(() => {
    const map = new Map<string, ImageItem>();
    for (const it of images || []) map.set((it as any)._id, it);
    return Array.from(map.values());
  }, [images]);

  const shuffledRef = useRef<ImageItem[]>([]);
  useEffect(() => {
    const ids = unique.map((i) => (i as any)._id).join(",");
    const prevIds = shuffledRef.current.map((i) => (i as any)._id).join(",");
    if (!shuffledRef.current.length || ids !== prevIds) {
      shuffledRef.current = shuffleArray(unique);
    }
  }, [unique]);

  const shuffled = shuffledRef.current;

  const imageTags = useMemo(() => {
    return new Map<string, string[]>(
      shuffled.map((img) => [
        img._id,
        (img.tags || []).map((t) => t.trim()).filter(Boolean),
      ]),
    );
  }, [shuffled]);

  const availableTags = useMemo(() => {
    const s = new Set<string>();
    for (const tags of imageTags.values()) tags.forEach((t) => s.add(t));
    return Array.from(s).sort();
  }, [imageTags]);

  const filteredList = useMemo(() => {
    if (!selectedTags.length) return shuffled;
    return shuffled.filter((img) => {
      const tags = imageTags.get(img._id) || [];
      return selectedTags.every((tag) => tags.includes(tag));
    });
  }, [shuffled, selectedTags, imageTags]);

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

  const currentList = filteredList;
  const displayed = showAll ? currentList : currentList.slice(0, visibleCount);

  function openModalFromDisplayed(indexInDisplayed: number) {
    const img = displayed[indexInDisplayed];
    const globalIndex = currentList.findIndex((s) => s._id === img._id);
    setModalIndex(globalIndex >= 0 ? globalIndex : 0);
    setModalOpen(true);
  }

  useEffect(() => {
    if (modalIndex >= currentList.length) setModalIndex(0);
  }, [currentList.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!modalOpen) return;
      if (e.key === "Escape") setModalOpen(false);
      if (e.key === "ArrowRight")
        setModalIndex((i) => (i + 1) % currentList.length);
      if (e.key === "ArrowLeft")
        setModalIndex((i) => (i - 1 + currentList.length) % currentList.length);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, currentList.length]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function clearTags() {
    setSelectedTags([]);
  }

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex gap-5 items-center flex-wrap">
          <Filter />
          <div className="flex gap-2">
            {availableTags.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tags</div>
            ) : (
              availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <Button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    variant="outline"
                    className={`hover:bg-gray-300 hover:text-black rounded-none ${
                      active
                        ? "bg-primary text-primary-foreground border-transparent hover:bg-primary hover:text-white"
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    {tag}
                  </Button>
                );
              })
            )}
          </div>
          {availableTags.length > 0 && (
            <button onClick={clearTags}>Clear</button>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowAll((s) => !s)}>
            {showAll
              ? "Show less"
              : `Show ${Math.min(visibleCount, currentList.length)} / ${currentList.length}`}
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
          <div
            key={img._id}
            className="overflow-hidden break-inside-avoid"
            role="article"
          >
            <button
              onClick={() => openModalFromDisplayed(i)}
              className="outline-none w-full group relative"
              aria-label={`Open ${img.filename || "image"}`}
            >
              <ImageParallax img={img} />

              <div className="absolute inset-0 pointer-events-none flex items-end">
                <div className="w-full p-1 opacity-0 group-hover:opacity-100 transition">
                  <div className="bg-gradient-to-t from-black/70 to-transparent p-2 flex flex-wrap gap-2">
                    {(imageTags.get(img._id) || []).slice(0, 8).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 bg-black/30 text-white"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {filteredList.length > visibleCount &&
        (!showAll && currentList.length > visibleCount ? (
          <div className="break-inside-avoid flex justify-center my-12">
            <button
              onClick={() => setShowAll(true)}
              className="w-[20%] min-h-12 df"
            >
              Show all ({currentList.length})
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
        ))}

      {modalOpen && currentList.length > 0 && (
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
                {modalIndex + 1} / {currentList.length}
              </div>
              <div className="flex gap-2">
                <button
                  className="outline-none"
                  onClick={() => setModalOpen(false)}
                >
                  <CircleX />
                </button>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-lg rounded-lg overflow-hidden flex items-center justify-center h-[75vh]">
              <ModalImageWithSkeleton img={currentList[modalIndex]} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <button
                className="outline-none"
                onClick={() =>
                  setModalIndex(
                    (i) => (i - 1 + currentList.length) % currentList.length,
                  )
                }
              >
                <ArrowLeft />
              </button>
              <button
                className="outline-none"
                onClick={() =>
                  setModalIndex((i) => (i + 1) % currentList.length)
                }
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-masonry img {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
    </div>
  );
}

function ImageParallax({ img }: { img: ImageItem }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const f = () => (Math.random() + 0.5) * 100;
  const yRaw = useTransform(scrollYProgress, [0, 1], [f(), -f()]);
  const y = useSpring(yRaw, { damping: 20, stiffness: 100 });

  return (
    <div className="w-full relative overflow-hidden outline" ref={ref}>
      {!loaded && (
        <div className="absolute inset-0">
          <Skeleton className="h-[200px] w-full" />
        </div>
      )}

      <motion.div
        style={{ y: y }}
        className="w-full will-change-transform relative"
      >
        <Image
          src={img.url || ""}
          alt={img.filename || "gallery image"}
          width={800}
          height={600}
          onLoadingComplete={() => setLoaded(true)}
          className="w-full h-auto block transform scale-[2] object-fill"
          unoptimized
        />
      </motion.div>
    </div>
  );
}

function ModalImageWithSkeleton({ img }: { img?: ImageItem }) {
  const [loaded, setLoaded] = useState(false);

  if (!img) return null;

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-[60vh] w-[60vw] rounded-md" />
        </div>
      )}

      <Image
        src={img.url || ""}
        alt={img.filename || "image"}
        width={1600}
        height={1200}
        onLoadingComplete={() => setLoaded(true)}
        className="max-w-full max-h-full object-contain"
        unoptimized
      />
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
