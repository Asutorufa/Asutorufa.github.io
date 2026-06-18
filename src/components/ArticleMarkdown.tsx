import { useEffect, useRef } from "react";

type ArticleMarkdownProps = {
  html: string;
};

export function ArticleMarkdown({ html }: ArticleMarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let renderSequence = 0;
    let scheduledRender = 0;

    const renderMermaid = async () => {
      const container = containerRef.current;
      if (!container) return;

      const nodes = Array.from(container.querySelectorAll<HTMLElement>(".mermaid"));
      if (nodes.length === 0) return;

      const sequence = ++renderSequence;
      const isDark = document.documentElement.classList.contains("dark-mode");

      try {
        const { default: mermaid } = await import("mermaid");
        if (cancelled || sequence !== renderSequence) return;

        for (const node of nodes) {
          if (!node.dataset.mermaidSource) {
            node.dataset.mermaidSource = node.textContent ?? "";
          }
          node.removeAttribute("data-processed");
          node.textContent = node.dataset.mermaidSource;
        }

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: isDark ? "dark" : "default"
        });

        await mermaid.run({ nodes });
      } catch (error: unknown) {
        console.error("Failed to render Mermaid diagrams", error);
      }
    };

    const scheduleRenderMermaid = () => {
      window.clearTimeout(scheduledRender);
      scheduledRender = window.setTimeout(() => {
        void renderMermaid();
      }, 0);
    };

    scheduleRenderMermaid();

    const observer = new MutationObserver(() => {
      scheduleRenderMermaid();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("asutorufa-theme-change", scheduleRenderMermaid);

    return () => {
      cancelled = true;
      window.clearTimeout(scheduledRender);
      observer.disconnect();
      window.removeEventListener("asutorufa-theme-change", scheduleRenderMermaid);
    };
  }, [html]);

  return <div ref={containerRef} className="article-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
