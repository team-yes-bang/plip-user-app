export type UiDiaryTheme = {
  id: string;
  themeUuid: string;
  name: string;
  thumbnailSrc?: string;
};

export type UiDiaryClip = {
  id: string;
  /** video-service UUID — 재생 API용 */
  videoUuid: string;
  themeId: string;
  date: string;
  thumbnailSrc?: string;
  caption?: string;
  createdAt?: string;
};

export type UiDiaryDateEntry = {
  date: string;
  relativeLabel?: string;
  hasClips: boolean;
  isEmpty?: boolean;
  thumbnailPaths?: string[];
};

export type UiDiaryDateThemeGroup = {
  themeId: string;
  themeName: string;
  clipCount: number;
  clips?: UiDiaryClip[];
};

export type UiDiaryDateGroup = {
  date: string;
  themes: UiDiaryDateThemeGroup[];
};

export type UiDiaryThemeDateGroup = {
  date: string;
  clipCount: number;
  clips?: UiDiaryClip[];
};

export type UiDiaryThemeTimelinePage = {
  dateGroups: UiDiaryThemeDateGroup[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type UiDiaryDateWindow = {
  focusDate: string;
  days: Record<string, UiDiaryDateThemeGroup[]>;
};
