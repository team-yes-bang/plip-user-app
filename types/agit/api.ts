export type ApiMyAgitItem = {
  agitUuid: string;
  agitName: string;
};

export type ApiAgitMemberRole = "HOST" | "GUEST";

export type ApiAgitStatus = "ACTIVE" | "DELETED";

export type ApiAgitDetailMember = {
  ampId: number | null;
  userUuid: string;
  nickname: string;
  profileImagePath: string | null;
  role: ApiAgitMemberRole;
};

export type ApiAgitDetailTopic = {
  topicId: string;
  startedAt: string | null;
};

export type ApiAgitDetail = {
  agitUuid: string;
  agitName: string;
  description: string | null;
  thumbnailPath: string | null;
  status: ApiAgitStatus;
  maximumCapacity: number;
  currentMemberCount: number;
  hostNickname: string;
  myRole: ApiAgitMemberRole;
  code: string;
  members: ApiAgitDetailMember[];
  topics: ApiAgitDetailTopic[];
};

export type ApiCreateAgitRequest = {
  agitName: string;
  description?: string;
  maximumCapacity: number;
  thumbnailPath?: string;
  nickname: string;
  profileImagePath?: string;
};

export type ApiCreateAgitResponse = {
  agitUuid: string;
  agitName: string;
  description: string | null;
  maximumCapacity: number;
  code: string;
  thumbnailPath: string | null;
  ampId: number;
  nickname: string;
  profileImagePath: string | null;
  role: ApiAgitMemberRole;
};

export type ApiUpdateAgitRequest = {
  agitName: string;
  description?: string;
  maximumCapacity: number;
  thumbnailPath?: string;
};

export type ApiUpdateAgitResponse = {
  agitUuid: string;
  agitName: string;
  description: string | null;
  maximumCapacity: number;
  thumbnailPath: string | null;
};

export type ApiUpdateMyMemberProfileRequest = {
  nickname?: string;
  profileImagePath?: string;
};

export type ApiUpdateMyMemberProfileResponse = {
  nickname: string;
  profileImagePath: string | null;
};

export type ApiReissueInviteCodeResponse = {
  code: string;
};

export type ApiAgitLanding = {
  agitName: string;
  description: string | null;
  currentMemberCount: number;
  maximumCapacity: number;
  hostNickname: string;
  thumbnailPath: string | null;
};

export type ApiJoinAgitRequest = {
  nickname: string;
  profileImagePath?: string;
};

export type ApiJoinAgitResponse = {
  agitUuid: string;
  ampId: number;
  nickname: string;
  profileImagePath: string | null;
  role: ApiAgitMemberRole;
};

export type ApiAgitPreview = {
  agitUuid: string;
  agitName: string;
  description: string | null;
  currentMemberCount: number;
  maximumCapacity: number;
  hostNickname: string;
  thumbnailPath: string | null;
  myStatus: "ACTIVE" | "PENDING" | "LEFT" | "BANNED" | null;
};

export type ApiJoinRequestItem = {
  ampId: number;
  userUuid: string;
  nickname: string;
  profileImagePath: string | null;
};

export type ApiDiscoverSort = "new" | "popular" | "rising";

export type ApiDiscoverAgitItem = {
  agitUuid: string;
  agitName: string;
  description: string | null;
  thumbnailPath: string | null;
  createdAt: string | null;
  score: number | null;
};

export type ApiDiscoverSearchPage = {
  items: ApiDiscoverAgitItem[];
  page: number;
  size: number;
  total: number;
};

export type ApiAgitThumbnailUploadUrlResponse = {
  uploadKey: string;
  thumbnailPath: string;
  uploadUrl: string;
  expiresAt: string;
};
