import type { BlogConfig } from "../types/content";
import { Icon } from "./Icon";

type SiteFooterProps = {
  config: BlogConfig;
};

export function SiteFooter({ config }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span aria-label="Copyright">&copy;</span>
        <span>{year}</span>
        <span className="site-footer-love">
          <Icon name="user" />
        </span>
        <span>{config.author}</span>
      </div>
    </footer>
  );
}
