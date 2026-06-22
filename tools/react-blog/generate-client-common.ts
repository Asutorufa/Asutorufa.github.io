import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { collectContent } from "./collect-content";
import { commonContentForClient } from "./html";
import { rootDir } from "./paths";

export async function generateClientCommonModule() {
  const content = await collectContent();
  await writeClientCommonModule(content);
}

export async function writeClientCommonModule(content: Awaited<ReturnType<typeof collectContent>>) {
  const outputPath = `${rootDir}/src/generated/blog-common.ts`;
  const commonContent = commonContentForClient(content);
  await fs.mkdir(`${rootDir}/src/generated`, { recursive: true });
  await fs.writeFile(
    outputPath,
    [
      'import type { CommonContent } from "../app/app-types";',
      "",
      `export const commonContent = ${toTsLiteral(commonContent)} satisfies CommonContent;`,
      ""
    ].join("\n")
  );
}

function toTsLiteral(value: unknown, indent = 0): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => toTsLiteral(item, indent)).join(", ")}]`;

  const padding = " ".repeat(indent);
  const childPadding = " ".repeat(indent + 2);
  const entries = Object.entries(value)
    .map(([key, item]) => `${childPadding}${key}: ${toTsLiteral(item, indent + 2)}`)
    .join(",\n");
  return `{\n${entries}\n${padding}}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateClientCommonModule().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
