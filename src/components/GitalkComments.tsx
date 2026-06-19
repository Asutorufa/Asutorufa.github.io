import { useEffect, useRef } from "react";

type GitalkCommentsProps = {
  id: string;
};

export function GitalkComments({ id }: GitalkCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const container = containerRef.current;
    if (container) container.innerHTML = "";

    const renderGitalk = async () => {
      if (!container || cancelled || container.dataset.gitalkLoaded === id) return;
      container.dataset.gitalkLoaded = id;

      const [{ default: Gitalk }] = await Promise.all([import("gitalk"), import("gitalk/dist/gitalk.css")]);
      if (cancelled) return;

      const gitalk = new Gitalk({
        clientID: "c800a9b9d97b6bef0dfe",
        clientSecret: "cb3b257598e1a7b9910007c148a33f0054864ef7",
        accessToken: "d392150a899ebcfb18f8837f18c2e4a554b25cec",
        repo: "Asutorufa.github.io",
        owner: "Asutorufa",
        admin: ["Asutorufa"],
        id,
        distractionFreeMode: true
      });
      gitalk.render("gitalk-container");
    };

    if (!container) return undefined;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          void renderGitalk();
        },
        {
          rootMargin: "360px 0px"
        }
      );
      observer.observe(container);
    } else {
      void renderGitalk();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [id]);

  return <div ref={containerRef} id="gitalk-container" className="mt-12 max-w-full overflow-hidden" />;
}
