"use client";

import { StaticImageData } from "next/image";
import React, { JSX, useEffect, useId, useMemo, useRef, useState } from "react";
import { createNoise2D } from "simplex-noise";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

type Props = {
  src: string | { src: string } | StaticImageData;
  src2?: string | { src: string } | StaticImageData;
  rectCount?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  speed?: number;
  noiseScale?: number;
  className?: string;
};

type RectMask = {
  seed: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export default function AnimatedRectMaskImage({
  src,
  src2,
  rectCount = 6,
  minWidth = 60,
  maxWidth = 240,
  minHeight = 40,
  maxHeight = 200,
  speed = 1.0,
  noiseScale = 0.002,
  className = "w-full h-auto",
}: Props): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animRef = useRef<number | null>(null);
  const masksRef = useRef<RectMask[]>([]);
  const reactId = useId();
  const maskId = `mask-${reactId.replace(/[:.]/g, "-")}`;
  const [imgSize, setImgSize] = useState({ w: 800, h: 600 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  const mouseRectCount = 10;
  const offsetRange = 100;

  const normalizedSrc =
    typeof src === "string"
      ? src
      : src && typeof src === "object" && "src" in src
        ? (src as any).src
        : String(src);

  const normalizedSrc2 =
    typeof src2 === "string"
      ? src2
      : src2 && typeof src2 === "object" && "src" in src2
        ? (src2 as any).src
        : String(src2);

  const noiseRef = useRef<((x: number, y: number) => number) | null>(null);
  useEffect(() => {
    noiseRef.current = createNoise2D();
  }, []);

  useEffect(() => {
    if (!normalizedSrc) return;
    const img = new Image();
    img.onload = () =>
      setImgSize({ w: img.naturalWidth || 800, h: img.naturalHeight || 600 });
    img.src = normalizedSrc;
  }, [normalizedSrc]);

  // initialize masks (perlin noise driven)
  useEffect(() => {
    const w = imgSize.w;
    const h = imgSize.h;
    masksRef.current = Array.from({ length: rectCount }).map((_, i) => ({
      seed: Math.floor(Math.random() * 1e9) + i * 65537,
      x: Math.random() * w,
      y: Math.random() * h,
      w: minWidth + Math.random() * (maxWidth - minWidth),
      h: minHeight + Math.random() * (maxHeight - minHeight),
    }));
  }, [
    rectCount,
    imgSize.w,
    imgSize.h,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
  ]);

  // main per-frame loop for noise rects
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const maskGroup = svg.querySelector<SVGGElement>("#maskGroup");
    if (!maskGroup) return;

    const totalRectCount = rectCount + mouseRectCount;

    // ensure proper number of rect children (only for the noise rects; mouse rects are rendered via React)
    while (maskGroup.children.length < totalRectCount) {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("fill", "white");
      maskGroup.appendChild(r);
    }
    while (maskGroup.children.length > totalRectCount)
      maskGroup.removeChild(maskGroup.lastChild as ChildNode);

    // only the first rectCount are controlled by noise (the later ones are replaced by React mouse rects)
    const rects: SVGRectElement[] = [];
    for (let i = 0; i < rectCount; i++)
      rects.push(maskGroup.children[i] as SVGRectElement);

    const step = (now: number) => {
      const t = now * 0.001 * speed;
      const w = imgSize.w;
      const h = imgSize.h;
      const ms = masksRef.current;
      const noise = noiseRef.current!;
      for (let i = 0; i < ms.length; i++) {
        const m = ms[i];
        const nx = noise(
          (m.seed + 1) * 0.000001 + t * noiseScale,
          m.seed * 0.000002 + t * noiseScale,
        );
        const ny = noise(
          (m.seed + 2) * 0.000001 + t * noiseScale,
          m.seed * 0.000003 + t * noiseScale,
        );
        const nw = noise(
          (m.seed + 3) * 0.000001 + t * noiseScale,
          m.seed * 0.000004 + t * noiseScale,
        );
        const nh = noise(
          (m.seed + 4) * 0.000001 + t * noiseScale,
          m.seed * 0.000005 + t * noiseScale,
        );

        const sx = (nx + 1) * 0.5;
        const sy = (ny + 1) * 0.5;
        const sw = (nw + 1) * 0.5;
        const sh = (nh + 1) * 0.5;

        const rw = minWidth + sw * (maxWidth - minWidth);
        const rh = minHeight + sh * (maxHeight - minHeight);
        const rx = Math.max(0, Math.min(w - rw, sx * w - rw / 2));
        const ry = Math.max(0, Math.min(h - rh, sy * h - rh / 2));

        m.x = rx;
        m.y = ry;
        m.w = rw;
        m.h = rh;

        const rElem = rects[i];
        if (!rElem) continue;
        rElem.setAttribute("x", String(Math.round(m.x)));
        rElem.setAttribute("y", String(Math.round(m.y)));
        rElem.setAttribute("width", String(Math.round(m.w)));
        rElem.setAttribute("height", String(Math.round(m.h)));
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
    };
  }, [
    rectCount,
    imgSize.w,
    imgSize.h,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    speed,
    noiseScale,
  ]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const boundingRect = svgRef.current?.getBoundingClientRect();
    if (!boundingRect) return;
    const x =
      (e.clientX - boundingRect.left) * (imgSize.w / boundingRect.width);
    const y =
      (e.clientY - boundingRect.top) * (imgSize.h / boundingRect.height);
    mouseX.set(x);
    mouseY.set(y);
  };

  const { w, h } = imgSize;

  const mouseRectsMeta = useMemo(
    () =>
      Array.from({ length: mouseRectCount }).map(() => ({
        ox: (Math.random() - 0.5) * offsetRange,
        oy: (Math.random() - 0.5) * offsetRange,
        w: minWidth + Math.random() * (maxWidth - minWidth),
        h: minHeight + Math.random() * (maxHeight - minHeight),
      })),
    // re-create only when these change
    [mouseRectCount, minWidth, maxWidth, minHeight, maxHeight, offsetRange],
  );

  const xDerived = mouseRectsMeta.map((meta) =>
    useTransform(mouseX, (v) => v + meta.ox - meta.w / 2),
  );
  const yDerived = mouseRectsMeta.map((meta) =>
    useTransform(mouseY, (v) => v + meta.oy - meta.h / 2),
  );

  const xSprings = xDerived.map((mv) =>
    useSpring(mv, { stiffness: 20, damping: 5 }),
  );
  const ySprings = yDerived.map((mv) =>
    useSpring(mv, { stiffness: 20, damping: 5 }),
  );

  const mouseRects = mouseRectsMeta.map((meta, i) => {
    return (
      <motion.rect
        key={`mouse-rect-${i}`}
        fill="white"
        style={{
          x: xSprings[i],
          y: ySprings[i],
          width: meta.w,
          height: meta.h,
          transformOrigin: "center",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: isHovering ? 1 : 0 }}
        transition={{
          scale: { type: "spring", stiffness: 120, damping: 14, mass: 0.5 },
        }}
      />
    );
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-auto"
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovering(false)}
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={w} height={h} fill="black" />
            <g id="maskGroup">
              {Array.from({ length: rectCount }).map((_, i) => (
                <rect
                  key={`placeholder-${i}`}
                  x={-9999}
                  y={-9999}
                  width={0}
                  height={0}
                  fill="white"
                />
              ))}
              {mouseRects}
            </g>
          </mask>
        </defs>

        <image
          href={normalizedSrc}
          x="0"
          y="0"
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid slice"
          style={{
            filter: "grayscale(100%) brightness(0.6) blur(20px)",
          }}
        />

        {src2 ? (
          <image
            href={normalizedSrc2}
            x="0"
            y="0"
            width={w}
            height={h}
            preserveAspectRatio="xMidYMid slice"
            style={{
              mask: `url(#${maskId})`,
              WebkitMask: `url(#${maskId})`,
            }}
            className="block w-full h-auto pointer-events-none"
          />
        ) : (
          <image
            href={normalizedSrc}
            x="0"
            y="0"
            width={w}
            height={h}
            preserveAspectRatio="xMidYMid slice"
            style={{
              filter: "grayscale(50%)",
              mask: `url(#${maskId})`,
              WebkitMask: `url(#${maskId})`,
            }}
            className="block w-full h-auto pointer-events-none"
          />
        )}
      </svg>
    </div>
  );
}
