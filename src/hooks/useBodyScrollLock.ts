import { useEffect } from "react";

export function useBodyScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);
}
