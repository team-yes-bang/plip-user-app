import * as diaryApi from "@/lib/api/diaryApi";
import type {
  ApiDiaryDateResponse,
  ApiDiaryDateSection,
  ApiDiaryDateWindowResponse,
  ApiDiaryHomeSection,
  ApiDiaryTheme,
  ApiDiaryTimelineSection,
  ApiDiaryVideoSummary,
} from "@/types/diary/api";
import type {
  UiDiaryClip,
  UiDiaryDateEntry,
  UiDiaryDateGroup,
  UiDiaryDateThemeGroup,
  UiDiaryDateWindow,
  UiDiaryTheme,
  UiDiaryThemeDateGroup,
  UiDiaryThemeTimelinePage,
} from "@/types/diary/ui";

function mapTheme(theme: ApiDiaryTheme): UiDiaryTheme {
  return {
    // 단건 PATCH/DELETE 경로는 numeric id 사용 (themeUuid 아님)
    id: String(theme.id),
    name: theme.name,
  };
}

function toOptionalThumbnail(path: string | null | undefined): string | undefined {
  return path?.trim() ? path.trim() : undefined;
}

function mapVideoSummary(
  video: ApiDiaryVideoSummary,
  themeId: string,
  date: string,
  index: number,
): UiDiaryClip {
  const legacyVideo = video as ApiDiaryVideoSummary & {
    diaryVideoId?: string | number;
    thumbnailPath?: string | null;
  };
  const clipId =
    legacyVideo.id != null
      ? String(legacyVideo.id)
      : legacyVideo.diaryVideoId != null
        ? String(legacyVideo.diaryVideoId)
        : legacyVideo.videoUuid ?? `${themeId}-${date}-${index}`;

  return {
    id: clipId,
    themeId,
    date,
    thumbnailSrc: toOptionalThumbnail(legacyVideo.thumbnailUrl ?? legacyVideo.thumbnailPath),
  };
}

const HOME_FEED_MAX_DAYS = 3;

function getTodayKstDateString(today = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
}

function resolveRelativeLabel(date: string, todayDate = getTodayKstDateString()): string | undefined {
  const target = new Date(`${date}T12:00:00`);
  const todayStart = new Date(`${todayDate}T12:00:00`);
  const diffDays = Math.round((todayStart.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays === 2) return "그제";
  return undefined;
}

function createEmptyHomeEntry(date: string): UiDiaryDateEntry {
  return {
    date,
    relativeLabel: resolveRelativeLabel(date),
    hasClips: false,
    isEmpty: true,
    thumbnailPaths: [],
  };
}

function normalizeHomeFeed(entries: UiDiaryDateEntry[]): UiDiaryDateEntry[] {
  const todayDate = getTodayKstDateString();
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));

  if (!byDate.has(todayDate)) {
    byDate.set(todayDate, createEmptyHomeEntry(todayDate));
  }

  const todayEntry = byDate.get(todayDate)!;
  const otherEntries = [...byDate.values()]
    .filter((entry) => entry.date !== todayDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, HOME_FEED_MAX_DAYS - 1);

  return [todayEntry, ...otherEntries].sort((a, b) => b.date.localeCompare(a.date));
}

function mapHomeSection(section: ApiDiaryHomeSection): UiDiaryDateEntry {
  const thumbnailPaths = section.videos
    .map((video) => toOptionalThumbnail(video.thumbnailUrl))
    .filter((path): path is string => Boolean(path));
  const hasClips = section.videos.length > 0;

  return {
    date: section.date,
    relativeLabel: resolveRelativeLabel(section.date),
    hasClips,
    isEmpty: !hasClips,
    thumbnailPaths,
  };
}

function mapDateThemeGroup(group: ApiDiaryDateSection, date: string): UiDiaryDateThemeGroup {
  const themeId = String(group.themeId);
  const legacyGroup = group as ApiDiaryDateSection & {
    diaryVideos?: ApiDiaryVideoSummary[];
  };
  const videos = Array.isArray(group.videos)
    ? group.videos
    : Array.isArray(legacyGroup.diaryVideos)
      ? legacyGroup.diaryVideos
      : [];

  return {
    themeId,
    themeName: group.themeName,
    clipCount: videos.length,
    clips: videos.map((video, index) => mapVideoSummary(video, themeId, date, index)),
  };
}

function mapTimelineSection(section: ApiDiaryTimelineSection, themeId: string): UiDiaryThemeDateGroup {
  const videos = Array.isArray(section.videos) ? section.videos : [];

  return {
    date: section.date,
    clipCount: videos.length,
    clips: videos.map((video, index) => mapVideoSummary(video, themeId, section.date, index)),
  };
}

function mapDateResponse(
  response: ApiDiaryDateResponse & {
    themes?: ApiDiaryDateSection[];
    writtenDate?: string;
  },
): UiDiaryDateGroup {
  const date = response.date ?? response.writtenDate ?? "";
  const sections = response.sections ?? response.themes ?? [];

  return {
    date,
    themes: sections.map((group) => mapDateThemeGroup(group, date)),
  };
}

export async function listDiaryThemes(): Promise<UiDiaryTheme[]> {
  const response = await diaryApi.getDiaryThemes();
  return response.themes.map(mapTheme);
}

export async function getDiaryTheme(themeId: string): Promise<UiDiaryTheme> {
  const theme = await diaryApi.getDiaryTheme(themeId);
  return mapTheme(theme);
}

export async function createDiaryTheme(themeName: string): Promise<UiDiaryTheme> {
  const created = await diaryApi.createDiaryTheme({ name: themeName });
  return mapTheme(created);
}

export async function updateDiaryThemeName(themeId: string, themeName: string): Promise<UiDiaryTheme> {
  const updated = await diaryApi.updateDiaryThemeName(themeId, { name: themeName });
  return mapTheme(updated);
}

export async function deleteDiaryTheme(themeId: string): Promise<void> {
  await diaryApi.deleteDiaryTheme(themeId);
}

export async function getDiaryHomeFeed(): Promise<UiDiaryDateEntry[]> {
  const response = await diaryApi.getDiaryHome();
  const entries = response.sections.map(mapHomeSection);
  return normalizeHomeFeed(entries);
}

export async function getDiaryHomePageData(): Promise<{
  entries: UiDiaryDateEntry[];
  themes: UiDiaryTheme[];
}> {
  const response = await diaryApi.getDiaryHome();
  return {
    entries: normalizeHomeFeed(response.sections.map(mapHomeSection)),
    themes: (response.themes ?? []).map(mapTheme),
  };
}

export async function getDiaryCalendarDates(year: number, month: number): Promise<string[]> {
  const response = await diaryApi.getDiaryCalendar(year, month);
  return response.writtenDates;
}

export async function getDiaryDateGroup(date: string): Promise<UiDiaryDateGroup> {
  const response = await diaryApi.getDiaryByDate(date);
  return mapDateResponse(response);
}

export async function getDiaryDateWindow(date: string, window = 1): Promise<UiDiaryDateWindow> {
  const response = await diaryApi.getDiaryDateWindow(date, window);
  return mapDateWindowResponse(response);
}

function mapDateWindowResponse(response: ApiDiaryDateWindowResponse): UiDiaryDateWindow {
  const days: Record<string, UiDiaryDateThemeGroup[]> = {};

  for (const day of response.days) {
    days[day.date] = day.sections.map((group) => mapDateThemeGroup(group, day.date));
  }

  return {
    focusDate: response.focusDate,
    days,
  };
}

export async function getDiaryThemeTimelinePage(
  themeId: string,
  cursor?: string,
): Promise<UiDiaryThemeTimelinePage> {
  const timeline = await diaryApi.getDiaryThemeTimeline(themeId, cursor);
  return {
    dateGroups: timeline.sections.map((section) => mapTimelineSection(section, themeId)),
    nextCursor: timeline.nextCursor ?? null,
    hasMore: Boolean(timeline.hasMore),
  };
}

export async function getDiaryThemeTimeline(themeId: string): Promise<{
  theme: UiDiaryTheme;
  dateGroups: UiDiaryThemeDateGroup[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const [theme, timeline] = await Promise.all([
    diaryApi.getDiaryTheme(themeId).then(mapTheme),
    getDiaryThemeTimelinePage(themeId),
  ]);

  return {
    theme,
    dateGroups: timeline.dateGroups,
    nextCursor: timeline.nextCursor,
    hasMore: timeline.hasMore,
  };
}

export async function transferDiaryVideoToTopic(
  diaryVideoId: string,
  topicId: string,
  transferType: "COPY" | "MOVE",
): Promise<void> {
  await diaryApi.transferDiaryVideoTopic(diaryVideoId, { topicId, transferType });
}

export async function unbindDiaryVideo(diaryVideoId: string): Promise<void> {
  await diaryApi.unbindDiaryVideo(diaryVideoId);
}
