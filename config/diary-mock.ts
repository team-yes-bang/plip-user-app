import type {
  UiDiaryDateEntry,
  UiDiaryDateThemeGroup,
  UiDiaryTheme,
  UiDiaryThemeDateGroup,
} from "@/types/diary/ui";

export const DIARY_THEMES: UiDiaryTheme[] = [
  { id: "daily", themeUuid: "00000000-0000-4000-8000-000000000001", name: "일상" },
  { id: "exercise", themeUuid: "00000000-0000-4000-8000-000000000002", name: "운동" },
  { id: "cooking", themeUuid: "00000000-0000-4000-8000-000000000003", name: "요리" },
];

export const DIARY_MAIN_ENTRIES: UiDiaryDateEntry[] = [
  { date: "2026-08-12", relativeLabel: "오늘", hasClips: false, isEmpty: true },
  { date: "2026-08-11", relativeLabel: "어제", hasClips: true },
  { date: "2026-08-10", relativeLabel: "그제", hasClips: true },
  { date: "2026-08-09", hasClips: true },
  { date: "2026-08-08", hasClips: true },
  { date: "2026-08-07", hasClips: false, isEmpty: true },
  { date: "2026-08-06", hasClips: true },
  { date: "2026-08-05", hasClips: true },
];

export const DIARY_DATE_GROUPS: Record<string, UiDiaryDateThemeGroup[]> = {
  "2026-08-11": [
    { themeId: "daily", themeName: "일상", clipCount: 5 },
    { themeId: "exercise", themeName: "운동", clipCount: 3 },
    { themeId: "cooking", themeName: "요리", clipCount: 2 },
  ],
  "2026-08-10": [
    { themeId: "daily", themeName: "일상", clipCount: 4 },
    { themeId: "cooking", themeName: "요리", clipCount: 5 },
  ],
  "2026-08-09": [
    { themeId: "exercise", themeName: "운동", clipCount: 4 },
    { themeId: "daily", themeName: "일상", clipCount: 2 },
  ],
  "2026-08-08": [{ themeId: "daily", themeName: "일상", clipCount: 6 }],
  "2026-08-06": [
    { themeId: "cooking", themeName: "요리", clipCount: 3 },
    { themeId: "exercise", themeName: "운동", clipCount: 2 },
  ],
  "2026-08-05": [{ themeId: "daily", themeName: "일상", clipCount: 5 }],
};

export const DIARY_THEME_DATE_GROUPS: Record<string, UiDiaryThemeDateGroup[]> = {
  daily: [
    { date: "2026-08-11", clipCount: 5 },
    { date: "2026-08-10", clipCount: 4 },
    { date: "2026-08-08", clipCount: 6 },
    { date: "2026-08-05", clipCount: 5 },
  ],
  exercise: [
    { date: "2026-08-11", clipCount: 3 },
    { date: "2026-08-09", clipCount: 4 },
    { date: "2026-08-06", clipCount: 2 },
  ],
  cooking: [
    { date: "2026-08-10", clipCount: 5 },
    { date: "2026-08-11", clipCount: 2 },
    { date: "2026-08-06", clipCount: 3 },
  ],
};

export function getThemeById(themeId: string): UiDiaryTheme | undefined {
  return DIARY_THEMES.find((theme) => theme.id === themeId);
}

export function formatDiaryDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}

export function formatDiaryWeekday(date: string): string {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"] as const;
  const parsed = new Date(`${date}T12:00:00`);
  return weekdays[parsed.getDay()];
}
