import { lazy, Suspense, useEffect, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import type { ImagePreviewState } from "./ImagePreview";
import { ImagePreviewLoading } from "./ImagePreviewLoading";

type ArticleMarkdownProps = {
  html: string;
};

type MermaidRenderer = typeof import("mermaid").default;

const ImagePreview = lazy(() => import("./ImagePreview").then((module) => ({ default: module.ImagePreview })));

export function ArticleMarkdown({ html }: ArticleMarkdownProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [preview, setPreview] = useState<ImagePreviewState | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = scope.current;
    if (!container) return;

    hydrateLazyImages(container);
    const cleanupMotionBlocks = hydrateMotionBlocks(container, animate, prefersReducedMotion);

    const openImagePreview = (image: HTMLImageElement) => {
      const images = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
      const slides = images.map(toPreviewSlide).filter((slide) => slide.src);
      const selectedSrc = image.currentSrc || image.src;
      const index = Math.max(
        0,
        slides.findIndex((slide) => slide.src === selectedSrc)
      );

      if (slides.length > 0) setPreview({ index, slides });
    };

    const onClick = (event: MouseEvent) => {
      const image = (event.target as Element | null)?.closest?.("img") as HTMLImageElement | null;
      if (!image || !container.contains(image)) return;
      event.preventDefault();
      openImagePreview(image);
    };

    container.addEventListener("click", onClick);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const image = event.target instanceof HTMLImageElement ? event.target : null;
      if (!image || !container.contains(image)) return;
      event.preventDefault();
      openImagePreview(image);
    };

    container.addEventListener("keydown", onKeyDown);

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
          flowchart: {
            useMaxWidth: false
          },
          sequence: {
            diagramMarginX: 0,
            diagramMarginY: 8,
            useMaxWidth: false
          },
          theme: "base",
          themeVariables: getMermaidThemeVariables()
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
      cleanupMotionBlocks();
      intersectionObserver?.disconnect();
      observer.disconnect();
      container.removeEventListener("click", onClick);
      container.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("asutorufa-theme-change", scheduleRenderedMermaidRefresh);
    };
  }, [animate, html, prefersReducedMotion, scope]);

  const closePreview = () => setPreview(null);

  return (
    <>
      <div ref={scope} className="article-content" data-article-body="" dangerouslySetInnerHTML={{ __html: html }} />
      {preview ? (
        <Suspense fallback={<ImagePreviewLoading />}>
          <ImagePreview preview={preview} onClose={closePreview} />
        </Suspense>
      ) : null}
    </>
  );
}

function hydrateLazyImages(container: HTMLElement) {
  for (const image of container.querySelectorAll<HTMLImageElement>("img")) {
    image.loading ||= "lazy";
    image.decoding ||= "async";
    if (!image.hasAttribute("tabindex")) image.tabIndex = 0;
  }
}

function hydrateMotionBlocks(container: HTMLElement, animate: ReturnType<typeof useAnimate<HTMLDivElement>>[1], prefersReducedMotion: boolean | null) {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>("h2, h3, h4, h5, h6, pre, img"));
  if (nodes.length === 0 || !("IntersectionObserver" in window)) return () => {};

  const controls = new Set<{ stop: () => void }>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target as HTMLElement;
        observer.unobserve(node);

        const isImage = node instanceof HTMLImageElement;
        const isCodeBlock = node.tagName === "PRE";
        const playback = animate(node, getBlockTarget(isImage, isCodeBlock, prefersReducedMotion), {
          duration: isCodeBlock ? 0.2 : 0.25,
          ease: "easeOut"
        });

        controls.add(playback);
        void playback.then(() => controls.delete(playback));
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  for (const node of nodes) {
    Object.assign(node.style, getBlockInitial(node instanceof HTMLImageElement, node.tagName === "PRE", prefersReducedMotion));
    observer.observe(node);
  }

  return () => {
    observer.disconnect();
    for (const playback of controls) playback.stop();
    controls.clear();
  };
}

function getBlockInitial(isImage: boolean, isCodeBlock: boolean, prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion || isCodeBlock) return { opacity: "0" };
  return isImage ? { opacity: "0", transform: "scale(0.98)" } : { opacity: "0", transform: "translateY(20px)" };
}

function getBlockTarget(isImage: boolean, isCodeBlock: boolean, prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion || isCodeBlock) return { opacity: 1 };
  return isImage ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };
}

function toPreviewSlide(image: HTMLImageElement) {
  const src = image.currentSrc || image.src;
  return {
    alt: image.alt,
    height: image.naturalHeight || undefined,
    src,
    width: image.naturalWidth || undefined
  };
}

function getMermaidThemeVariables() {
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);
  const color = (name: string, fallback: string) => rootStyle.getPropertyValue(name).trim() || fallback;
  const isDark = document.documentElement.classList.contains("dark-mode");

  const background = color("--blog-surface", isDark ? "#282828" : "#ffffff");
  const surfaceMuted = color("--blog-surface-muted", isDark ? "#242424" : "#fafafa");
  const pageBackground = color("--blog-bg", isDark ? "#1f1f1f" : "#f7f7f7");
  const text = color("--blog-text", isDark ? "#cfcfcf" : "#555555");
  const heading = color("--blog-heading", isDark ? "#e1e1e1" : "#444444");
  const border = color("--blog-border", isDark ? "#444444" : "#e5e5e5");
  const borderSoft = color("--blog-border-soft", isDark ? "#3d3d3d" : "#ececec");
  const accent = color("--blog-accent", isDark ? "#ff8b5f" : "#ff5b25");
  const accentLine = color("--blog-accent-line", isDark ? "#ff8b5f" : "#ff7a45");
  const accentSoft = color("--blog-accent-soft", isDark ? "#342f2c" : "#fff4ed");
  const accentSofter = color("--blog-accent-softer", isDark ? "#302a27" : "#fff8f4");
  const accentBorder = color("--blog-accent-border", isDark ? "#8a5a48" : "#ffb28f");

  return {
    background,
    darkMode: isDark,
    fontFamily: bodyStyle.fontFamily,
    primaryColor: accentSoft,
    primaryTextColor: heading,
    primaryBorderColor: accentBorder,
    secondaryColor: surfaceMuted,
    secondaryTextColor: text,
    secondaryBorderColor: borderSoft,
    tertiaryColor: accentSofter,
    tertiaryTextColor: text,
    tertiaryBorderColor: border,
    mainBkg: accentSoft,
    secondBkg: surfaceMuted,
    nodeBorder: accentBorder,
    clusterBkg: pageBackground,
    clusterBorder: border,
    titleColor: heading,
    textColor: text,
    nodeTextColor: heading,
    lineColor: accentLine,
    arrowheadColor: accent,
    defaultLinkColor: accentLine,
    edgeLabelBackground: background,
    noteBkgColor: accentSofter,
    noteTextColor: text,
    noteBorderColor: accentBorder,
    actorBkg: accentSoft,
    actorBorder: accentBorder,
    actorTextColor: heading,
    actorLineColor: accentLine,
    signalColor: accentLine,
    signalTextColor: heading,
    labelBoxBkgColor: background,
    labelBoxBorderColor: border,
    labelTextColor: text,
    loopTextColor: text,
    activationBkgColor: accentSofter,
    activationBorderColor: accentBorder,
    sequenceNumberColor: background
  };
}
