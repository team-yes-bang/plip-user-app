export type UiTopicVideo = {
  id: string;
  thumbnailSrc: string;
  profileImageSrc: string;
  profileNickname: string;
  uploadedAt: string;
  caption: string;
};

export type UiTopic = {
  id: string;
  videos: UiTopicVideo[];
};

export type UiTopicSummary = {
  id: string;
  title: string;
  startAt: string;
  isToday: boolean;
};

export type UiTopicListItem = {
  id: string;
  title: string;
  startAtLabel: string;
  videoCount: number;
  creatorUuid: string;
};

export type UiTopicDetail = {
  id: string;
  title: string;
  startDate: string;
  videoCount: number;
  creatorUuid: string;
  uploadedByMe: boolean | null;
};

export type UiTopicListSectionKey = "ongoing" | "upcoming" | "past";

export type UiTopicListSection = {
  items: UiTopicListItem[];
  error?: string;
};

export type UiTopicListSections = Record<UiTopicListSectionKey, UiTopicListSection>;

export type UiTopicGallery = {
  topic: UiTopicSummary | null;
  videos: UiTopicVideo[];
};

export type UiTopicFeedWindow = {
  topics: UiTopicDetail[];
  currentId: string | null;
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
};
