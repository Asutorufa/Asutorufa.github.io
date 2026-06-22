import { createPortal } from "react-dom";
import styles from "./ImagePreviewLoading.module.css";

export function ImagePreviewLoading() {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.root} role="status" aria-label="Loading image preview">
      <span className={styles.spinner} aria-hidden="true" />
    </div>,
    document.body
  );
}
