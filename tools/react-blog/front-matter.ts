export type FrontMatterFile<T> = {
  content: T;
  data: Record<string, unknown>;
  matter: string;
};

export function parseFrontMatter(rawInput: string): FrontMatterFile<string> {
  const raw = rawInput.replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);

  if (!match) {
    return {
      content: raw,
      data: {},
      matter: ""
    };
  }

  return {
    content: raw.slice(match[0].length),
    data: parseMatterBlock(match[1]),
    matter: match[1]
  };
}

function parseMatterBlock(matter: string) {
  const data: Record<string, unknown> = {};
  const lines = matter.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const pair = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (!pair) continue;

    const [, key, rawValue = ""] = pair;
    if (rawValue.trim()) {
      data[key] = parseScalar(rawValue);
      continue;
    }

    const items: unknown[] = [];
    let cursor = index + 1;
    while (cursor < lines.length) {
      const item = /^\s*-\s*(.*)$/.exec(lines[cursor]);
      if (!item) break;
      items.push(parseScalar(item[1]));
      cursor += 1;
    }

    if (items.length) {
      data[key] = items;
      index = cursor - 1;
    } else {
      data[key] = "";
    }
  }

  return data;
}

function parseScalar(rawValue: string): unknown {
  const value = stripInlineComment(rawValue).trim();
  if (!value) return "";

  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;

  if (isQuoted(value)) {
    const inner = value.slice(1, -1);
    return value.startsWith('"') ? unescapeDoubleQuoted(inner) : inner.replace(/''/g, "'");
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return parseInlineArray(value.slice(1, -1));
  }

  return value;
}

function parseInlineArray(value: string) {
  const items: unknown[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      current += char;
      if (char === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === ",") {
      items.push(parseScalar(current));
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) items.push(parseScalar(current));
  return items;
}

function stripInlineComment(value: string) {
  let quote: '"' | "'" | null = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "#" && (index === 0 || /\s/.test(value[index - 1]))) {
      return value.slice(0, index);
    }
  }
  return value;
}

function isQuoted(value: string) {
  return (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
}

function unescapeDoubleQuoted(value: string) {
  return value.replace(/\\(["\\/bfnrt])/g, (_, char: string) => {
    switch (char) {
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      default:
        return char;
    }
  });
}
