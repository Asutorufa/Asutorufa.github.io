import { motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import type { SiteLanguage } from "../types/content";
import { useSiteLabels } from "../components/SiteLanguageProvider";

type NotFoundPageProps = {
  fallbackLanguage?: SiteLanguage;
};

export function NotFoundPage({ fallbackLanguage = "en" }: NotFoundPageProps) {
  const labels = useSiteLabels(fallbackLanguage);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="content-card px-5 py-20 text-center md:px-12 lg:px-16">
      <motion.h1
        className="text-5xl font-semibold tracking-tight text-blog-heading"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.normal}
      >
        404
      </motion.h1>
      <p className="mt-4 text-blog-muted">{labels.notFound}</p>
      <div className="mt-6">
        <a
          href="/"
          className="inline-flex items-center rounded-full border border-blog-accent-border bg-blog-accent-soft px-4 py-1.5 text-[13px] font-medium text-blog-accent-strong transition-colors hover:border-blog-accent hover:bg-blog-accent-fill hover:text-white"
        >
          {labels.home}
        </a>
      </div>
    </section>
  );
}
