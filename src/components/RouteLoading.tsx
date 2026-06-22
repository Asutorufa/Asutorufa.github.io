import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./RouteLoading.module.css";

type RouteLoadingProps = {
  active: boolean;
};

export function RouteLoading({ active }: RouteLoadingProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.root} role="status" aria-label="Loading page">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>Loading</span>
    </div>,
    document.body
  );
}
