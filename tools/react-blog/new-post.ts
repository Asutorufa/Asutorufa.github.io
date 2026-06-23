import fs from "node:fs/promises";
import path from "node:path";
import { LANGUAGE_META } from "../../src/data/i18n";
import type { SiteLanguage } from "../../src/types/content";
import { postsDir, rootDir, toPosixPath } from "./paths";

type NewPostOptions = {
  dryRun: boolean;
  language: SiteLanguage;
  title: string;
};

const DEFAULT_POST_LANGUAGE: SiteLanguage = "zh-Hans";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const directoryName = safeDirectoryName(options.title);
  const postDir = path.join(postsDir, directoryName);
  const postPath = path.join(postDir, "doc.md");

  await assertAvailable(postPath);

  const now = new Date();
  const markdown = createPostMarkdown({
    abbrlink: String(now.getTime()),
    date: formatLocalDateTime(now),
    language: options.language,
    title: options.title
  });

  if (!options.dryRun) {
    await fs.mkdir(postDir, { recursive: true });
    await fs.writeFile(postPath, markdown, "utf8");
  }

  const relativePath = toPosixPath(path.relative(rootDir, postPath));
  console.log(`${options.dryRun ? "Would create" : "Created"} ${relativePath}`);
}

function parseArgs(args: string[]): NewPostOptions {
  let dryRun = false;
  let language = DEFAULT_POST_LANGUAGE;
  const titleParts: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--lang" || arg === "--language") {
      language = parseLanguage(readOptionValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith("--lang=")) {
      language = parseLanguage(arg.slice("--lang=".length));
      continue;
    }

    if (arg.startsWith("--language=")) {
      language = parseLanguage(arg.slice("--language=".length));
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    titleParts.push(arg);
  }

  const title = titleParts.join(" ").trim();
  if (!title) {
    throw new Error('Missing post title. Usage: npm run post:new -- "Post title"');
  }

  return {
    dryRun,
    language,
    title
  };
}

function readOptionValue(args: string[], index: number, option: string) {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

function parseLanguage(value: string): SiteLanguage {
  if (isSiteLanguage(value)) return value;
  const languages = Object.keys(LANGUAGE_META).join(", ");
  throw new Error(`Unsupported language: ${value}. Use one of: ${languages}`);
}

function isSiteLanguage(value: string): value is SiteLanguage {
  return Object.hasOwn(LANGUAGE_META, value);
}

async function assertAvailable(postPath: string) {
  try {
    await fs.access(postPath);
  } catch {
    return;
  }

  throw new Error(`Post already exists: ${toPosixPath(path.relative(rootDir, postPath))}`);
}

function safeDirectoryName(title: string) {
  const normalized = title
    .normalize("NFKC")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "untitled";
}

function createPostMarkdown({ abbrlink, date, language, title }: { abbrlink: string; date: string; language: SiteLanguage; title: string }) {
  return `---
title: ${quoteYaml(title)}
abbrlink: '${abbrlink}'
date: ${date}
updated: ${date}
tags: []
categories: []
language: ${language}
---

`;
}

function quoteYaml(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function formatLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function printHelp() {
  console.log(`Create a new post.

Usage:
  npm run post:new -- "Post title"
  npm run post:new -- "Post title" --lang ja

Options:
  --lang, --language  Post language: ${Object.keys(LANGUAGE_META).join(", ")}
  --dry-run           Print the path without writing files
`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
