import { useEffect, useRef } from "react";

type ArticleMarkdownProps = {
  html: string;
};

type MermaidRenderer = typeof import("mermaid").default;

export function ArticleMarkdown({ html }: ArticleMarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    hydrateLazyImages(container);

    let cancelled = false;
    let scheduledRender = 0;
    let mermaidPromise: Promise<MermaidRenderer> | undefined;
    let renderQueue = Promise.resolve();
    let intersectionObserver: IntersectionObserver | undefined;

    const renderedNodes = new Set<HTMLElement>();

    const getMermaid = () => {
      mermaidPromise ??= import("mermaid").then((module) => module.default);
      return mermaidPromise;
    };

    const prepareMermaidNode = (node: HTMLElement) => {
      node.dataset.mermaidSource ||= node.textContent ?? "";
      node.classList.add("mermaid-pending");
      node.setAttribute("aria-busy", "true");
    };

    const renderMermaidNodesNow = async (nodes: HTMLElement[]) => {
      const renderableNodes = nodes.filter((node) => node.isConnected && node.dataset.mermaidSource);
      if (renderableNodes.length === 0) return;

      const mermaid = await getMermaid();
      if (cancelled) return;

      for (const node of renderableNodes) {
        node.removeAttribute("data-processed");
        node.textContent = node.dataset.mermaidSource ?? "";
      }

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: document.documentElement.classList.contains("dark-mode") ? "dark" : "default"
        });

        await mermaid.run({ nodes: renderableNodes });

        for (const node of renderableNodes) {
          node.removeAttribute("aria-busy");
          node.classList.remove("mermaid-pending");
          renderedNodes.add(node);
        }
      } catch (error: unknown) {
        console.error("Failed to render Mermaid diagrams", error);
        for (const node of renderableNodes) {
          node.removeAttribute("aria-busy");
          node.classList.remove("mermaid-pending");
          node.classList.add("mermaid-error");
        }
      }
    };

    const renderMermaidNodes = (nodes: HTMLElement[]) => {
      renderQueue = renderQueue.then(() => renderMermaidNodesNow(nodes));
      renderQueue.catch((error: unknown) => {
        console.error("Failed to queue Mermaid rendering", error);
      });
    };

    const scheduleRenderedMermaidRefresh = () => {
      window.clearTimeout(scheduledRender);
      scheduledRender = window.setTimeout(() => {
        renderMermaidNodes(Array.from(renderedNodes));
      }, 0);
    };

    const mermaidNodes = Array.from(container.querySelectorAll<HTMLElement>(".mermaid"));
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visibleNodes: HTMLElement[] = [];
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const node = entry.target as HTMLElement;
            intersectionObserver?.unobserve(node);
            visibleNodes.push(node);
          }
          renderMermaidNodes(visibleNodes);
        },
        { rootMargin: "720px 0px" }
      );

      for (const node of mermaidNodes) {
        prepareMermaidNode(node);
        intersectionObserver.observe(node);
      }
    } else {
      for (const node of mermaidNodes) {
        prepareMermaidNode(node);
      }
      renderMermaidNodes(mermaidNodes);
    }

    const observer = new MutationObserver(() => {
      scheduleRenderedMermaidRefresh();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("asutorufa-theme-change", scheduleRenderedMermaidRefresh);

    return () => {
      cancelled = true;
      window.clearTimeout(scheduledRender);
      intersectionObserver?.disconnect();
      observer.disconnect();
      window.removeEventListener("asutorufa-theme-change", scheduleRenderedMermaidRefresh);
    };
  }, [html]);

  return <div ref={containerRef} className="article-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

function hydrateLazyImages(container: HTMLElement) {
  for (const image of container.querySelectorAll<HTMLImageElement>("img")) {
    image.loading ||= "lazy";
    image.decoding ||= "async";
  }
}
