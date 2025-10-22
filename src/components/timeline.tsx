import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, X } from "lucide-react";

export interface TimelineObject {
  image: string;
  fromDate: string;
  toDate?: string;
  title: string;
  loc: string;
  mapsEmbed?: string;
}

export default function Timeline({
  objects,
  className = "",
}: {
  objects: TimelineObject[];
  className?: string;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedMap, setExpandedMap] = useState<number | null>(null);
  const firstMountRef = useRef(true);
  useEffect(() => {
    firstMountRef.current = false;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpandedIndex(null);
        setExpandedMap(null);
      }
    };
    window.addEventListener("keyup", handleKey);
    return () => {
      window.removeEventListener("keyup", handleKey);
    };
  }, []);

  const formatDate = (from: string, to?: string) => {
    if (to) return `${from} - ${to}`;
    return from;
  };

  return (
    <div className={`relative py-12 px-4 ${className}`}>
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-text"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, ease: [0.87, 0, 0.13, 1] }}
        style={{ originY: 0 }}
      />

      <div className="relative max-w-6xl mx-auto">
        {objects.map((item, idx) => {
          const isLeft = idx % 2 === 0;
          const isExpanded = expandedIndex === idx;
          const isMapExpanded = expandedMap === idx;

          return (
            <div key={idx} className="relative mb-48 last:mb-0">
              <div className="grid grid-cols-2 gap-8 items-center relative">
                {isLeft ? (
                  <motion.div
                    className="flex justify-end pr-12"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: idx * 0.2 + 0.3,
                      type: "tween",
                      duration: 1.2,
                      ease: [0.87, 0, 0.13, 1],
                    }}
                  >
                    <Card
                      item={item}
                      align="right"
                      expandMap={() =>
                        setExpandedMap(isMapExpanded ? null : idx)
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex justify-end pr-12"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: idx * 0.2 + 0.3,
                      type: "tween",
                      duration: 1.2,
                      ease: [0.87, 0, 0.13, 1],
                    }}
                  >
                    <div className="text-right text-lg text-gray-600 font-medium">
                      {formatDate(item.fromDate, item.toDate)}
                    </div>
                  </motion.div>
                )}

                {isLeft ? (
                  <motion.div
                    className="flex justify-start pl-12"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 + 0.3 }}
                  >
                    <div className="text-left text-lg text-gray-600 font-medium">
                      {formatDate(item.fromDate, item.toDate)}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex justify-start pl-12"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 + 0.3 }}
                  >
                    <Card
                      item={item}
                      align="left"
                      expandMap={() =>
                        setExpandedMap(isMapExpanded ? null : idx)
                      }
                    />
                  </motion.div>
                )}

                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <AnimatePresence mode="wait">
                    {!isExpanded ? (
                      <motion.div
                        key="icon"
                        className="relative"
                        initial={
                          firstMountRef.current
                            ? { scale: 0, opacity: 0 }
                            : false
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: idx * 0.2 + 0.5,
                          ease: [0.33, 1, 0.68, 1],
                          type: "tween",
                        }}
                      >
                        <motion.button
                          className="w-12 h-12 rounded-full shadow-lg overflow-hidden bg-white"
                          onClick={() => setExpandedIndex(idx)}
                          whileHover={{ scale: 1.1 }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded"
                        className="relative z-100"
                        initial={{ scale: 1, width: 80, height: 80 }}
                        animate={{ scale: 1, width: 500, height: 500 }}
                        exit={{ scale: 0.9, width: 80, height: 80 }}
                        transition={{
                          type: "tween",
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <motion.div
                          className="relative w-full h-full overflow-hidden shadow-2xl"
                          layoutId={`image-${idx}`}
                          exit={{ borderRadius: "100%" }}
                          transition={{ duration: 0.1, type: "tween" }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />

                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3, type: "tween" }}
                          >
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              transition={{ duration: 0.1, type: "tween" }}
                            >
                              <h2 className="text-3xl font-bold text-white mb-2">
                                {item.title}
                              </h2>
                              <p className="text-lg text-gray-200 mb-2">
                                {item.loc}
                              </p>
                              <p className="text-sm text-gray-300">
                                {formatDate(item.fromDate, item.toDate)}
                              </p>
                            </motion.div>
                          </motion.div>

                          <motion.button
                            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                            onClick={() => setExpandedIndex(null)}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, type: "tween" }}
                          >
                            <X className="w-6 h-6 text-white" />
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <AnimatePresence>
                {isMapExpanded && item.mapsEmbed && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setExpandedMap(null)}
                  >
                    <motion.div
                      className="relative max-w-4xl w-full h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-white"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", damping: 25 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-full h-full">
                        <iframe
                          src={item.mapsEmbed}
                          className="w-full h-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>

                      <button
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg z-10"
                        onClick={() => setExpandedMap(null)}
                      >
                        <X className="w-6 h-6 text-gray-800" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  item,
  align,
  expandMap,
}: {
  item: TimelineObject;
  align: "left" | "right";
  expandMap: () => any;
}) {
  return (
    <div
      className={`bg-white shadow-sm p-6 hover:shadow-lg transition-shadow border border-gray-100 max-w-sm ${align === "right" ? "text-right" : "text-left"}`}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>

      <div className="flex items-start gap-4">
        {align === "left" && item.mapsEmbed && (
          <motion.button
            className="flex justify-center"
            onClick={(e) => {
              e.stopPropagation();
              expandMap();
            }}
          >
            <Map className="text-muted" />
          </motion.button>
        )}
        <p className="text-sm text-muted leading-relaxed">{item.loc}</p>
        {align === "right" && item.mapsEmbed && (
          <motion.button
            className="flex justify-center"
            onClick={(e) => {
              e.stopPropagation();
              expandMap();
            }}
          >
            <Map className="text-muted" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
