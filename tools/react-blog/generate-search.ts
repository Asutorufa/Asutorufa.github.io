import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest } from "../../src/types/content";
import { distDir } from "./paths";
import { escapeHtml } from "./html";

export async function generateSearch(content: ContentManifest) {
  const records = content.posts.map((post) => ({
    title: post.title,
    url: post.route,
    language: post.language,
    tags: post.tags,
    categories: post.categories,
    content: post.plainText
  }));

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<search>
${records
  .map(
    (record) => `  <entry>
    <title>${escapeHtml(record.title)}</title>
    <url>${record.url}</url>
    <language>${record.language}</language>
    <content>${escapeHtml(record.content)}</content>
  </entry>`
  )
  .join("\n")}
</search>
`;

  await fs.writeFile(path.join(distDir, "search.xml"), xml);
  await fs.writeFile(path.join(distDir, "search.json"), JSON.stringify(records, null, 2));
}
