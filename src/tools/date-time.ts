export function formatLocalDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function parseLocalDateTime(value: string) {
  const match = /^\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?\s*$/.exec(value);
  if (!match) return undefined;

  const [, rawYear, rawMonth, rawDay, rawHour = "0", rawMinute = "0", rawSecond = "0"] = match;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const second = Number(rawSecond);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || minute < 0 || second < 0) return undefined;

  const date = new Date(year, month - 1, day, hour, minute, second);
  if (!Number.isFinite(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }

  return date;
}
