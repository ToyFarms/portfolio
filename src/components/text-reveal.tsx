"use client";

import { motion, MotionProps, useInView } from "framer-motion";
import React, { useRef, useEffect } from "react";

export default function TextReveal({
  children,
  className,
  splitBy,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  splitBy?: "word" | "char";
} & MotionProps &
  React.HTMLAttributes<HTMLDivElement>) {
  const indexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    indexRef.current = 0;
  }, [splitBy]);

  const processChildren = (child: React.ReactNode): React.ReactNode => {
    if (typeof child === "string") {
      const words = splitBy === "char" ? Array.from(child) : child.split(" ");
      return words.map((word, i) => {
        const currentIndex = indexRef.current++;
        return (
          <div
            key={`word-${currentIndex}`}
            className="inline-block overflow-hidden indent-0"
          >
            <motion.div
              {...rest}
              initial={{ y: "100%" }}
              animate={isInView ? "visible" : "initial"}
              variants={{
                visible: (i: number) => ({
                  y: "-4%",
                  transition: {
                    type: "tween",
                    delay: i * 0.05,
                    duration: 1.2,
                    ease: [0, 0.55, 0.45, 1],
                  },
                }),
              }}
              className="inline-block will-change-transform"
              custom={currentIndex}
            >
              {word +
                (i !== words.length - 1 && splitBy !== "char" ? "\u00A0" : "")}
            </motion.div>
          </div>
        );
      });
    }

    if (React.isValidElement(child)) {
      if (child.type === "br") {
        return child;
      }

      const processedProps = {
        ...child.props,
        children: React.Children.map(child.props.children, processChildren),
      };
      return React.cloneElement(child, processedProps);
    }

    if (Array.isArray(child)) {
      return React.Children.map(child, processChildren);
    }

    return child;
  };

  return (
    <span ref={containerRef} className={className}>
      {processChildren(children)}
    </span>
  );
}
