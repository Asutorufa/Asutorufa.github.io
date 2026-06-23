import os from "node:os";

export function buildConcurrency() {
  const configured = Number(process.env.REACT_BLOG_CONCURRENCY ?? process.env.BLOG_BUILD_CONCURRENCY ?? "");
  if (Number.isFinite(configured) && configured > 0) return clampConcurrency(configured);

  const detected = typeof os.availableParallelism === "function" ? os.availableParallelism() : os.cpus().length;
  return clampConcurrency(detected || 4);
}

export async function mapConcurrent<T, R>(items: readonly T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= items.length) return;
        results[index] = await worker(items[index] as T, index);
      }
    })
  );

  return results;
}

function clampConcurrency(value: number) {
  return Math.max(1, Math.min(32, Math.floor(value)));
}
