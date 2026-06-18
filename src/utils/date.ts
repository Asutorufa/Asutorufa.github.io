export function formatDisplayDate(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}
