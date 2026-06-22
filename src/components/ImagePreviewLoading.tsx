import styles from "./ImagePreviewLoading.module.css";

export function ImagePreviewLoading() {
  return (
    <div className={styles.root} role="status" aria-label="Loading image preview">
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
