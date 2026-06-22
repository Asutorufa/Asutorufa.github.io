import type { BlogConfig } from "../types/content";
import { Icon } from "./Icon";
import styles from "./SiteFooter.module.css";

type SiteFooterProps = {
  config: BlogConfig;
};

export function SiteFooter({ config }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <span aria-label="Copyright">&copy;</span>
        <span>{year}</span>
        <span className={styles.love}>
          <Icon name="user" />
        </span>
        <span>{config.author}</span>
      </div>
    </footer>
  );
}
