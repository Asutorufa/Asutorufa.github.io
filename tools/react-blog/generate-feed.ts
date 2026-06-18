import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest } from "../../src/types/content";
import { formatDate } from "./content-utils";
import { distDir } from "./paths";
import { escapeHtml } from "./html";

export async function generateFeed(content: ContentManifest) {
  const updated = content.posts[0]?.updated ?? content.posts[0]?.date ?? new Date().toISOString();
  const entries = content.posts.slice(0, 100).map((post) => {
    const url = new URL(post.route, content.config.url).toString();
    return `<entry>
  <title>${escapeHtml(post.title)}</title>
  <link href="${url}" />
  <id>${url}</id>
  <published>${toIso(post.date)}</published>
  <updated>${toIso(post.updated ?? post.date)}</updated>
  <summary>${escapeHtml(post.plainText.slice(0, 240))}</summary>
</entry>`;
  });

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml(content.config.title)}</title>
  <subtitle>${escapeHtml(content.config.subtitle)}</subtitle>
  <link href="${content.config.url}/atom.xml" rel="self" />
  <link href="${content.config.url}/" />
  <id>${content.config.url}/</id>
  <updated>${toIso(updated)}</updated>
${entries.join("\n")}
</feed>
`;

  await fs.writeFile(path.join(distDir, "atom.xml"), xml);
}

function toIso(value: string) {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? `${formatDate(value)}T00:00:00.000Z` : date.toISOString();
}
