import { useEffect } from "react";

type GitalkCommentsProps = {
  id: string;
};

export function GitalkComments({ id }: GitalkCommentsProps) {
  useEffect(() => {
    let cancelled = false;
    const container = document.getElementById("gitalk-container");
    if (container) container.innerHTML = "";

    void import("gitalk").then(({ default: Gitalk }) => {
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
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return <div id="gitalk-container" className="mt-12 max-w-full overflow-hidden" />;
}
