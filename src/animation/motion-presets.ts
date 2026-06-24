export const MotionPresets = {
  fast: {
    duration: 0.15
  },
  normal: {
    duration: 0.25
  },
  slow: {
    duration: 0.35
  },
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30
  }
} as const;
