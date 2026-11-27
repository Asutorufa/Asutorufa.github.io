export const MotionEase = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.4, 0, 0.2, 1]
} as const;

export const MotionPresets = {
  instant: {
    duration: 0
  },
  fast: {
    duration: 0.16,
    ease: MotionEase.out
  },
  normal: {
    duration: 0.22,
    ease: MotionEase.out
  },
  slow: {
    duration: 0.3,
    ease: MotionEase.out
  },
  spring: {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.85
  }
} as const;
