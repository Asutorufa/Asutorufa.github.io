import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { IconButton } from "./IconButton";
import styles from "./ImagePreview.module.css";

type PreviewSlide = {
  alt?: string;
  height?: number;
  src: string;
  width?: number;
};

export type ImagePreviewOrigin = {
  borderRadius?: number;
  height: number;
  left: number;
  top: number;
  width: number;
};

export type ImagePreviewState = {
  index: number;
  origin?: ImagePreviewOrigin;
  slides: PreviewSlide[];
};

type ImagePreviewProps = {
  preview: ImagePreviewState | null;
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.5;
const WHEEL_NAVIGATION_THRESHOLD = 90;
const SWIPE_DISTANCE_THRESHOLD = 72;
const SWIPE_VELOCITY_THRESHOLD = 520;
const DESKTOP_IMAGE_PADDING_X = 144;
const DESKTOP_IMAGE_PADDING_Y = 160;
const MOBILE_IMAGE_PADDING_X = 28.8;
const MOBILE_IMAGE_PADDING_Y = 152;

type FigureExitMode = "close" | "switch";
type NavigationDirection = -1 | 0 | 1;
type PanLimits = { maxX: number; maxY: number };

type WebKitGestureEvent = Event & {
  scale: number;
};

export function ImagePreview({ preview, onClose }: ImagePreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const open = preview !== null;
  const slides = preview?.slides ?? [];
  const [index, setIndex] = useState(preview?.index ?? 0);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [playedOpenTransition, setPlayedOpenTransition] = useState(false);
  const [visible, setVisible] = useState(open);
  const [viewportSize, setViewportSize] = useState(() => getViewportSize());
  const [exitMode, setExitMode] = useState<FigureExitMode>("close");
  const [navigationDirection, setNavigationDirection] = useState<NavigationDirection>(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const gestureStartScale = useRef(MIN_SCALE);
  const wheelNavigation = useRef({ timeout: 0, x: 0 });

  const requestClose = useCallback(() => {
    setExitMode("close");
    setVisible(false);
  }, []);

  useBodyScrollLock(open);
  useEscapeKey(open, requestClose);

  useEffect(() => {
    if (!preview) return;
    setVisible(true);
    setIndex(clamp(preview.index, 0, Math.max(0, preview.slides.length - 1)));
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
    setImageLoaded(false);
    setPlayedOpenTransition(false);
    setExitMode("close");
    setNavigationDirection(0);
  }, [preview]);

  useEffect(() => {
    if (!open) return;

    const updateViewportSize = () => setViewportSize(getViewportSize());
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, [open]);

  useEffect(() => {
    const wheelState = wheelNavigation.current;
    return () => window.clearTimeout(wheelState.timeout);
  }, []);

  const activeSlide = slides[index];
  const targetBox = useMemo(() => getTargetBox(activeSlide, viewportSize), [activeSlide, viewportSize]);
  const panLimits = useMemo(() => getPanLimits(targetBox, scale, viewportSize), [scale, targetBox, viewportSize]);
  const sourceMotion = useMemo(() => {
    if (!preview?.origin || !targetBox || index !== preview.index) return undefined;
    return getOriginMotion(preview.origin, targetBox, viewportSize);
  }, [index, preview, targetBox, viewportSize]);
  const originInitialMotion = playedOpenTransition ? undefined : sourceMotion;
  const switchingSlides = exitMode === "switch" && navigationDirection !== 0;
  const slideDistance = viewportSize.width;
  const canMove = slides.length > 1;
  const canZoomOut = scale > MIN_SCALE;
  const canZoomIn = scale < MAX_SCALE;
  const imageTransformed = scale > MIN_SCALE || offset.x !== 0 || offset.y !== 0;

  const resetImageTransform = useCallback(() => {
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  }, []);

  const move = useCallback(
    (direction: -1 | 1) => {
      if (!canMove) return;
      setExitMode("switch");
      setNavigationDirection(direction);
      setIndex((current) => wrapIndex(current + direction, slides.length));
      setImageLoaded(false);
      resetImageTransform();
    },
    [canMove, resetImageTransform, slides.length]
  );

  const zoom = useCallback((direction: -1 | 1) => {
    setScale((current) => {
      const next = clamp(Number((current + direction * SCALE_STEP).toFixed(2)), MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const zoomByFactor = useCallback((factor: number) => {
    setScale((current) => {
      const next = clamp(Number((current * factor).toFixed(3)), MIN_SCALE, MAX_SCALE);
      if (next === current) return current;
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const setZoomScale = useCallback((value: number) => {
    setScale((current) => {
      const next = clamp(Number(value.toFixed(3)), MIN_SCALE, MAX_SCALE);
      if (next === current) return current;
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const onWheel = useCallback(
    (event: WheelEvent) => {
      if (!activeSlide) return;
      if (!isPreviewEventTarget(event, rootRef.current)) return;

      event.preventDefault();
      event.stopPropagation();

      const { deltaX, deltaY } = normalizeWheelDelta(event);
      const horizontal = Math.abs(deltaX);
      const vertical = Math.abs(deltaY);
      const isPinch = event.ctrlKey || event.metaKey;

      if (isPinch) {
        if (vertical > 0) {
          zoomByFactor(Math.exp(-deltaY * 0.01));
        }
        return;
      }

      if (canMove && horizontal > vertical * 1.25 && horizontal > 8) {
        wheelNavigation.current.x += deltaX;
        window.clearTimeout(wheelNavigation.current.timeout);
        wheelNavigation.current.timeout = window.setTimeout(() => {
          wheelNavigation.current.x = 0;
        }, 180);

        if (Math.abs(wheelNavigation.current.x) >= WHEEL_NAVIGATION_THRESHOLD) {
          move(wheelNavigation.current.x > 0 ? 1 : -1);
          wheelNavigation.current.x = 0;
        }
        return;
      }

      if (!isPinch && scale > MIN_SCALE && (horizontal > 0 || vertical > 0)) {
        setOffset((current) => clampOffset({ x: current.x - deltaX, y: current.y - deltaY }, panLimits));
        return;
      }

      if (vertical > 0) {
        zoomByFactor(Math.exp(-deltaY * 0.003));
      }
    },
    [activeSlide, canMove, move, panLimits, scale, zoomByFactor]
  );

  useEffect(() => {
    if (!open || !visible) return;

    const onGestureStart = (event: Event) => {
      if (!isPreviewEventTarget(event, rootRef.current)) return;
      event.preventDefault();
      gestureStartScale.current = scale;
    };

    const onGestureChange = (event: Event) => {
      if (!isPreviewEventTarget(event, rootRef.current)) return;
      event.preventDefault();
      setZoomScale(gestureStartScale.current * (event as WebKitGestureEvent).scale);
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("gesturestart", onGestureStart, { capture: true, passive: false });
    window.addEventListener("gesturechange", onGestureChange, { capture: true, passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("gesturestart", onGestureStart, true);
      window.removeEventListener("gesturechange", onGestureChange, true);
    };
  }, [onWheel, open, scale, setZoomScale, visible]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button")) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoom(1);
      } else if (event.key === "-") {
        event.preventDefault();
        zoom(-1);
      } else if (event.key === "0") {
        event.preventDefault();
        resetImageTransform();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move, open, resetImageTransform, zoom]);

  useEffect(() => {
    setOffset((current) => {
      const next = clampOffset(current, panLimits);
      if (next.x === current.x && next.y === current.y) return current;
      return next;
    });
  }, [panLimits]);

  const imageDrag = scale > MIN_SCALE ? true : canMove ? "x" : false;
  const imageDragConstraints =
    scale > MIN_SCALE
      ? { left: -panLimits.maxX, right: panLimits.maxX, top: -panLimits.maxY, bottom: panLimits.maxY }
      : { left: 0, right: 0 };
  const imageStyle = useMemo(() => ({ cursor: scale > MIN_SCALE || canMove ? "grab" : "zoom-in" }), [canMove, scale]);

  const markImageElement = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div ref={rootRef} className={styles.root} role="dialog" aria-modal="true" aria-label="Image preview" data-image-preview-root="">
      <AnimatePresence>
        {visible && activeSlide ? (
          <motion.button
            key="backdrop"
            className={styles.backdrop}
            type="button"
            aria-label="Close image preview"
            onClick={requestClose}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence
        onExitComplete={() => {
          if (!visible) onClose();
        }}
      >
        {visible && activeSlide ? (
          <motion.figure
            key={`figure-${index}-${activeSlide.src}`}
            className={styles.figure}
            initial={getFigureInitial(originInitialMotion, prefersReducedMotion, navigationDirection, slideDistance)}
            animate={{ borderRadius: 8, opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0 }}
            exit={getFigureExit(exitMode === "close" ? sourceMotion : undefined, prefersReducedMotion, navigationDirection, exitMode, slideDistance, {
              offset,
              scale
            })}
            onAnimationComplete={() => {
              if (visible) setPlayedOpenTransition(true);
            }}
            transition={getFigureTransition(prefersReducedMotion)}
          >
            <div className={styles.imageFrame} style={targetBox ? { height: targetBox.height, width: targetBox.width } : undefined}>
              <motion.img
                className={`${styles.image} ${imageTransformed ? styles.imageTransformed : styles.imageResting}`}
                ref={markImageElement}
                src={activeSlide.src}
                alt={activeSlide.alt ?? ""}
                draggable={false}
                style={imageStyle}
                animate={{
                  opacity: imageLoaded || originInitialMotion || switchingSlides ? 1 : 0,
                  scale,
                  x: offset.x,
                  y: offset.y
                }}
                transition={{
                  opacity: { duration: prefersReducedMotion ? 0 : 0.16 },
                  scale: { duration: prefersReducedMotion ? 0 : 0.18 },
                  x: { duration: scale === MIN_SCALE ? 0.18 : 0 },
                  y: { duration: scale === MIN_SCALE ? 0.18 : 0 }
                }}
                drag={imageDrag}
                dragConstraints={imageDragConstraints}
                dragElastic={scale > MIN_SCALE ? 0 : 0.22}
                dragMomentum={false}
                onClick={() => (scale === MIN_SCALE ? zoom(1) : undefined)}
                onDoubleClick={resetImageTransform}
                onDragStart={() => {
                  dragOrigin.current = offset;
                }}
                onDrag={(_, info) => {
                  if (scale === MIN_SCALE) return;
                  setOffset(clampOffset({ x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y }, panLimits));
                }}
                onDragEnd={(_, info) => {
                  if (scale > MIN_SCALE || !canMove) return;
                  if (Math.abs(info.offset.x) < SWIPE_DISTANCE_THRESHOLD && Math.abs(info.velocity.x) < SWIPE_VELOCITY_THRESHOLD) return;
                  move(info.offset.x < 0 || info.velocity.x < 0 ? 1 : -1);
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              {!imageLoaded ? <span className={styles.loader} aria-hidden="true" /> : null}
            </div>
          </motion.figure>
        ) : null}
      </AnimatePresence>

      {visible && activeSlide && canMove ? (
        <>
          <IconButton className={`${styles.button} ${styles.previous}`} icon="chevron-left" label="Previous image" onClick={() => move(-1)} />
          <IconButton className={`${styles.button} ${styles.next}`} icon="chevron-right" label="Next image" onClick={() => move(1)} />
        </>
      ) : null}

      <AnimatePresence>
        {visible && activeSlide ? (
          <motion.div
            key="toolbar"
            className={styles.toolbar}
            initial={prefersReducedMotion ? { opacity: 1, x: "-50%" } : { opacity: 0, x: "-50%", y: -8 }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", y: -8 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.14, duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
          >
            <IconButton className={styles.button} icon="zoom-out" label="Zoom out" disabled={!canZoomOut} onClick={() => zoom(-1)} />
            <button className={styles.scaleButton} type="button" onClick={resetImageTransform} disabled={scale === MIN_SCALE}>
              {Math.round(scale * 100)}%
            </button>
            <IconButton className={styles.button} icon="zoom-in" label="Zoom in" disabled={!canZoomIn} onClick={() => zoom(1)} />
            <IconButton className={styles.button} icon="close" label="Close image preview" onClick={requestClose} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {visible && activeSlide && slides.length > 1 ? (
          <motion.p
            key="counter"
            className={styles.counter}
            initial={prefersReducedMotion ? { opacity: 1, x: "-50%" } : { opacity: 0, x: "-50%", y: 8 }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", y: 8 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.14, duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
          >
            {index + 1} / {slides.length}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function getViewportSize() {
  if (typeof window === "undefined") return { height: 1, width: 1 };
  return { height: window.innerHeight, width: window.innerWidth };
}

function getTargetBox(slide: PreviewSlide | undefined, viewportSize: { height: number; width: number }) {
  if (!slide) return undefined;

  const mobile = viewportSize.width <= 720;
  const maxWidth = Math.max(1, viewportSize.width - (mobile ? MOBILE_IMAGE_PADDING_X : DESKTOP_IMAGE_PADDING_X));
  const maxHeight = Math.max(1, viewportSize.height - (mobile ? MOBILE_IMAGE_PADDING_Y : DESKTOP_IMAGE_PADDING_Y));
  const width = slide.width && slide.width > 0 ? slide.width : maxWidth;
  const height = slide.height && slide.height > 0 ? slide.height : maxHeight;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    height: Math.max(1, height * ratio),
    width: Math.max(1, width * ratio)
  };
}

function getOriginMotion(origin: ImagePreviewOrigin, targetBox: { height: number; width: number }, viewportSize: { height: number; width: number }) {
  const originCenterX = origin.left + origin.width / 2;
  const originCenterY = origin.top + origin.height / 2;
  return {
    borderRadius: origin.borderRadius ?? 8,
    scaleX: origin.width / targetBox.width,
    scaleY: origin.height / targetBox.height,
    x: originCenterX - viewportSize.width / 2,
    y: originCenterY - viewportSize.height / 2
  };
}

function getPanLimits(targetBox: { height: number; width: number } | undefined, scale: number, viewportSize: { height: number; width: number }): PanLimits {
  if (!targetBox || scale <= MIN_SCALE) return { maxX: 0, maxY: 0 };
  const minimumVisibleSize = 96;
  const scaledWidth = targetBox.width * scale;
  const scaledHeight = targetBox.height * scale;
  return {
    maxX: Math.max(0, (scaledWidth + viewportSize.width) / 2 - minimumVisibleSize),
    maxY: Math.max(0, (scaledHeight + viewportSize.height) / 2 - minimumVisibleSize)
  };
}

function getFigureInitial(
  originMotion: ReturnType<typeof getOriginMotion> | undefined,
  prefersReducedMotion: boolean | null,
  navigationDirection: NavigationDirection,
  slideDistance: number
) {
  if (prefersReducedMotion) return { opacity: 1 };
  if (navigationDirection !== 0) return { opacity: 1, x: navigationDirection * slideDistance };
  return originMotion ?? { opacity: 0, scaleX: 0.96, scaleY: 0.96, y: 14 };
}

function getFigureExit(
  originMotion: ReturnType<typeof getOriginMotion> | undefined,
  prefersReducedMotion: boolean | null,
  navigationDirection: NavigationDirection,
  exitMode: FigureExitMode,
  slideDistance: number,
  imageTransform: { offset: { x: number; y: number }; scale: number }
) {
  if (prefersReducedMotion) return { opacity: 0 };
  if (exitMode === "switch" && navigationDirection !== 0) return { opacity: 1, x: navigationDirection * -slideDistance };
  return originMotion ? { ...getCompensatedOriginMotion(originMotion, imageTransform), opacity: 1 } : { opacity: 0, scaleX: 0.96, scaleY: 0.96, y: 14 };
}

function getCompensatedOriginMotion(originMotion: ReturnType<typeof getOriginMotion>, imageTransform: { offset: { x: number; y: number }; scale: number }) {
  const scaleX = originMotion.scaleX / imageTransform.scale;
  const scaleY = originMotion.scaleY / imageTransform.scale;
  return {
    ...originMotion,
    scaleX,
    scaleY,
    x: originMotion.x - scaleX * imageTransform.offset.x,
    y: originMotion.y - scaleY * imageTransform.offset.y
  };
}

function getFigureTransition(prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion) return { duration: 0 };

  return {
    borderRadius: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    opacity: { duration: 0.18 },
    scaleX: { type: "spring", stiffness: 420, damping: 38, mass: 0.8 },
    scaleY: { type: "spring", stiffness: 420, damping: 38, mass: 0.8 },
    x: { type: "spring", stiffness: 420, damping: 38, mass: 0.8 },
    y: { type: "spring", stiffness: 420, damping: 38, mass: 0.8 }
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampOffset(offset: { x: number; y: number }, limits: PanLimits) {
  return {
    x: clamp(offset.x, -limits.maxX, limits.maxX),
    y: clamp(offset.y, -limits.maxY, limits.maxY)
  };
}

function wrapIndex(value: number, length: number) {
  if (length <= 0) return 0;
  return (value + length) % length;
}

function isPreviewEventTarget(event: Event, root: HTMLElement | null) {
  const target = event.target;
  return root !== null && (!(target instanceof Node) || root.contains(target));
}

function normalizeWheelDelta(event: WheelEvent) {
  const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  return {
    deltaX: event.deltaX * factor,
    deltaY: event.deltaY * factor
  };
}
