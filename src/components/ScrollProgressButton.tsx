import { useEffect, useState } from "react";
import { Icon } from "./Icon";

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
      className={`scroll-progress-button ${progress > 3 ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <span className="scroll-progress-button-icon">
        <Icon name="arrow-up" />
      </span>
      <span className="scroll-progress-button-value">{progress}%</span>
    </button>
  );
}
