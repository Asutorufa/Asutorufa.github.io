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

export const routeMotion = {
  enter: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -6
  },
  initial: {
    opacity: 0,
    y: 10
  },
  reducedExit: {
    opacity: 0,
    y: 0
  },
  reducedInitial: {
    opacity: 0,
    y: 0
  }
} as const;
