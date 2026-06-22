import fs from "node:fs/promises";
import path from "node:path";
import { distDir, fromRoot } from "./paths";

const copies = [
  ["source/images", "images"],
  ["source/js", "js"],
  ["source/ads.txt", "ads.txt"],
  ["source/robots.txt", "robots.txt"],
  ["source/favicon.ico", "favicon.ico"]
] as const;

export async function copyStaticAssets() {
  for (const [from, to] of copies) {
    await copyIfExists(fromRoot(from), path.join(distDir, to));
  }
}

async function copyIfExists(from: string, to: string) {
  try {
    const stat = await fs.stat(from);
    if (stat.isDirectory()) {
      await fs.cp(from, to, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
    }
  } catch {
    // Optional legacy assets are skipped when absent.
  }
}
