import type { UiLabels } from "../types/content";

type NotFoundPageProps = {
  labels: UiLabels;
};

export function NotFoundPage({ labels }: NotFoundPageProps) {
  return (
    <section className="content-card px-5 py-20 text-center md:px-12 lg:px-16">
      <h1 className="text-4xl font-semibold text-neutral-700">404</h1>
      <p className="mt-4 text-neutral-500">{labels.notFound}</p>
    </section>
  );
}
