import clsx from "clsx";
import type { CSSProperties, FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import { Icon } from "./Icon";
import styles from "./ScrollProgressButton.module.css";

export function ScrollProgressButton() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasComments, setHasComments] = useState(false);
  const [usesTouchInteraction, setUsesTouchInteraction] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isVisible = progress > 3;
  const showCommentsButton = hasComments && expanded && isVisible;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
      setProgress((current) => (current === nextProgress ? current : nextProgress));
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("asutorufa-route-change", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("asutorufa-route-change", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    const update = () => setHasComments(Boolean(document.getElementById("comments")));
    update();
    window.addEventListener("asutorufa-route-change", update);
    return () => {
      window.removeEventListener("asutorufa-route-change", update);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setUsesTouchInteraction(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!expanded || !usesTouchInteraction) return;

    const collapseOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setExpanded(false);
    };

    document.addEventListener("pointerdown", collapseOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", collapseOnOutsidePointer);
  }, [expanded, usesTouchInteraction]);

  const scrollToTop = () => {
    window.scrollTo({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: 0
    });
  };

  const scrollToComments = () => {
    const comments = document.getElementById("comments");
    if (!comments) return;
    comments.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
    setExpanded(false);
  };

  const handleBackToTop = () => {
    if (hasComments && usesTouchInteraction && !expanded) {
      setExpanded(true);
      return;
    }

    scrollToTop();
    setExpanded(false);
  };

  const collapseOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setExpanded(false);
  };

  return (
    <motion.div
      ref={rootRef}
      className={clsx(styles.root, isVisible && styles.visible, expanded && styles.expanded)}
      initial={false}
      animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96, y: prefersReducedMotion ? 0 : 8 }}
      transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.normal}
      style={{ "--scroll-progress": `${progress}%` } as CSSProperties}
      onMouseEnter={() => {
        if (!usesTouchInteraction) setExpanded(true);
      }}
      onMouseLeave={() => {
        if (!usesTouchInteraction) setExpanded(false);
      }}
      onFocus={() => setExpanded(true)}
      onBlur={collapseOnBlur}
    >
      <button type="button" className={clsx(styles.button, styles.progressButton)} onClick={handleBackToTop} aria-label="Back to top">
        <span className={clsx(styles.icon, styles.topIcon)}>
          <Icon name="arrow-up" />
        </span>
        <span className={styles.value}>{progress}%</span>
      </button>
      <AnimatePresence initial={false}>
        {showCommentsButton ? (
          <motion.div
            key="comments"
            className={styles.commentSlot}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, width: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
            transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.fast}
          >
            <button
              type="button"
              className={clsx(styles.button, styles.commentButton)}
              onClick={scrollToComments}
              aria-label="Jump to comments"
              title="Comments"
            >
              <span className={clsx(styles.icon, styles.commentIcon)}>
                <Icon name="message" />
              </span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
