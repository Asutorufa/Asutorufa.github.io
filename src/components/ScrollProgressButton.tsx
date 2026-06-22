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
  const rootVariants = prefersReducedMotion
    ? undefined
    : {
        hover: { scale: 1.02, y: -3 },
        tap: { scale: 0.97, y: 0 }
      };
  const topIconVariants = prefersReducedMotion
    ? undefined
    : {
        hover: { y: -2 },
        tap: { y: -5 }
      };
  const commentIconVariants = prefersReducedMotion
    ? undefined
    : {
        hover: { rotate: -8, scale: 1.08 },
        tap: { rotate: 0, scale: 0.92 }
      };
  const showCommentsButton = hasComments && expanded;

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const update = () => setHasComments(Boolean(document.getElementById("comments")));
    const scheduleUpdate = () => {
      update();
      window.requestAnimationFrame(update);
      window.setTimeout(update, 250);
    };
    const observer = new MutationObserver(update);

    update();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("asutorufa-route-change", scheduleUpdate);
    return () => {
      observer.disconnect();
      window.removeEventListener("asutorufa-route-change", scheduleUpdate);
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
      layout
      className={clsx(styles.root, progress > 3 && styles.visible, expanded && styles.expanded)}
      initial={false}
      animate={
        progress > 3
          ? { opacity: 1, pointerEvents: "auto", y: 0, scale: 1 }
          : { opacity: 0, pointerEvents: "none", y: prefersReducedMotion ? 0 : 8, scale: prefersReducedMotion ? 1 : 0.96 }
      }
      variants={rootVariants}
      whileHover={prefersReducedMotion ? undefined : "hover"}
      whileTap={prefersReducedMotion ? undefined : "tap"}
      transition={MotionPresets.spring}
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
      <motion.button layout type="button" className={clsx(styles.button, styles.progressButton)} onClick={handleBackToTop} aria-label="Back to top">
        <motion.span className={styles.icon} variants={topIconVariants} transition={MotionPresets.fast}>
          <Icon name="arrow-up" />
        </motion.span>
        <span className={styles.value}>{progress}%</span>
      </motion.button>
      <AnimatePresence initial={false}>
        {showCommentsButton ? (
          <motion.button
            key="comments"
            layout
            type="button"
            className={clsx(styles.button, styles.commentButton)}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, width: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, width: "2.25rem" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, width: 0 }}
            transition={MotionPresets.fast}
            onClick={scrollToComments}
            aria-label="Jump to comments"
            title="Comments"
          >
            <motion.span className={styles.icon} variants={commentIconVariants} transition={MotionPresets.fast}>
              <Icon name="message" />
            </motion.span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
