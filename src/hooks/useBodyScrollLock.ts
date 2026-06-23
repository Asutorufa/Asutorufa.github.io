import { useEffect } from "react";

let lockCount = 0;
let cleanupListeners: (() => void) | undefined;

export function useBodyScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;

    if (lockCount === 0) {
      const preventBackgroundScroll = (event: Event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-image-preview-root]")) return;
        event.preventDefault();
      };

      root.dataset.scrollLocked = "true";
      window.addEventListener("wheel", preventBackgroundScroll, { capture: true, passive: false });
      window.addEventListener("touchmove", preventBackgroundScroll, { capture: true, passive: false });
      cleanupListeners = () => {
        window.removeEventListener("wheel", preventBackgroundScroll, true);
        window.removeEventListener("touchmove", preventBackgroundScroll, true);
      };
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount > 0) return;

      cleanupListeners?.();
      cleanupListeners = undefined;
      delete root.dataset.scrollLocked;
    };
  }, [enabled]);
}
