export function toFeedOrder<T>(before: T[], current: T, after: T[]): T[] {
  return [...before].reverse().concat(current, after);
}

export function mergeUniqueById<T>(
  base: T[],
  extra: T[],
  getId: (item: T) => string,
  edge: "start" | "end",
): T[] {
  const seen = new Set(base.map(getId));
  const unique = extra.filter((item) => !seen.has(getId(item)));
  return edge === "start" ? [...unique, ...base] : [...base, ...unique];
}
