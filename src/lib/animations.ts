import { Variants } from "framer-motion";

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -100,
  },
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Fade in animation
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Slide up animation
export const slideUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Scale animation
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Transition configurations
export const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.3,
};

export const smoothTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.4,
};

export const quickTransition = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
};
