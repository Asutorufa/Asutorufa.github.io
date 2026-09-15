import path from "node:path";
import { fileURLToPath } from "node:url";
import { THREAT_REPORTS_PER_PAGE as DEFAULT_THREAT_REPORTS_PER_PAGE } from "../../src/utils/threats";

const here = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(here, "../..");
export const sourceDir = path.join(rootDir, "source");
export const postsDir = path.join(sourceDir, "_posts");
export const threatsDir = path.join(sourceDir, "_threats");
export const distDir = path.join(rootDir, "dist-react");
export const manifestDir = path.join(distDir, "manifest");

export const THREAT_REPORTS_PER_PAGE = DEFAULT_THREAT_REPORTS_PER_PAGE;

export function fromRoot(...parts: string[]) {
  return path.join(rootDir, ...parts);
}

export function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}
