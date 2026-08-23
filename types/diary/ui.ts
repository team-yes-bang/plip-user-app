export type UiDiaryTheme = {
  id: string;
  name: string;
};

export type UiDiaryClip = {
  id: string;
  themeId: string;
  date: string;
  thumbnailSrc?: string;
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
