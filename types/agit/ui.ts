export type UiAgitVisibility = "public" | "private";

export type UiAgitRole = "HOST" | "GUEST";

export type UiMyAgit = {
  id: string;
  name: string;
};

export type UiCreateAgitDraft = {
  title: string;
  intro: string;
  capacity: number;
  thumbnailPath?: string;
};

export type UiCreateAgitInput = {
  agitName: string;
  description?: string;
  maximumCapacity: number;
  nickname: string;
  thumbnailPath?: string;
  profileImagePath?: string;
};

export type UiAgit = {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  coverGradient: string;
  topicCount: number;
  visibility?: UiAgitVisibility;
  category?: string;
  maxMembers?: number;
  ownerName?: string;
  todayVideoCount?: number;
  videoCount?: number;
  topicSummary?: string;
  thumbnailSrc?: string;
  inviteCode?: string;
  joined?: boolean;
  hasNewChat?: boolean;
  chatUnreadCount?: number;
  hasTodayTopic?: boolean;
  myRole?: UiAgitRole;
};

export type UiAgitMember = {
  id: string;
  name: string;
  role: "owner" | "member";
};

export type UiAgitTopic = {
  id: string;
  title: string;
  clipCount: number;
};

export type UiCardChatMessage = {
  id: string;
  senderName: string;
  body: string;
  isMine: boolean;
  time?: string;
  replyTo?: {
    name: string;
    excerpt: string;
  };
};
