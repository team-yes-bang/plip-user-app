import type { UiDiaryThemeDateGroup } from "@/types/diary/ui";

export function mergeThemeDateGroups(
  existing: UiDiaryThemeDateGroup[],
  incoming: UiDiaryThemeDateGroup[],
): UiDiaryThemeDateGroup[] {
  if (incoming.length === 0) {
    return existing;
  }

  const merged = [...existing];

  for (const group of incoming) {
    const last = merged[merged.length - 1];
    if (last && last.date === group.date) {
      const clips = [...(last.clips ?? []), ...(group.clips ?? [])];
      merged[merged.length - 1] = {
        ...last,
        clips,
        clipCount: clips.length,
      };
      continue;
    }

    merged.push(group);
  }

  return merged;
}
