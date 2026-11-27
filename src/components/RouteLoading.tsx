import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import styles from "./RouteLoading.module.css";

type RouteLoadingProps = {
  active: boolean;
};

export function RouteLoading({ active }: RouteLoadingProps) {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={styles.root}
          role="status"
          aria-label="Loading page"
          initial={prefersReducedMotion ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", y: -8 }}
          animate={{ opacity: 1, x: "-50%", y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", y: -6 }}
          transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.fast}
        >
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.text}>Loading</span>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
