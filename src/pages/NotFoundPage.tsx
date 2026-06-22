import { motion, useReducedMotion } from "motion/react";
import type { UiLabels } from "../types/content";

type NotFoundPageProps = {
  labels: UiLabels;
};

export function NotFoundPage({ labels }: NotFoundPageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="content-card px-5 py-20 text-center md:px-12 lg:px-16">
      <motion.h1
        className="text-4xl font-semibold text-blog-heading"
        animate={prefersReducedMotion ? undefined : { rotate: [-2, 2, -2] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      >
        404
      </motion.h1>
      <p className="mt-4 text-blog-muted">{labels.notFound}</p>
    </section>
  );
}
