import clsx from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import styles from "./ScrollProgressButton.module.css";

export function ScrollProgressButton() {
  const [progress, setProgress] = useState(0);

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

  return (
    <button
      type="button"
      className={clsx(styles.button, progress > 3 && styles.visible)}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <span className={styles.icon}>
        <Icon name="arrow-up" />
      </span>
      <span className={styles.value}>{progress}%</span>
    </button>
  );
}
