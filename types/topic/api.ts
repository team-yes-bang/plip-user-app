export type ApiTopicListStatus = "ONGOING" | "UPCOMING" | "PAST";

export type ApiTopic = {
  topicUuid: string;
  agitUuid: string;
  creatorUuid: string;
  title: string | null;
  startAt: string;
  videoCount: number;
  uploadedByMe: boolean | null;
  createdAt: string;
};

export type ApiCreateTopicRequest = {
  agitUuid: string;
  title: string;
  startAt?: string;
};

export type ApiUpdateTopicRequest = {
  title?: string;
  startAt?: string;
};

export type ApiTopicVideo = {
  videoUuid: string;
  userUuid: string;
  createdAt: string;
};

export type ApiTopicFeed = {
  current: ApiTopic | null;
  before: ApiTopic[];
  after: ApiTopic[];
};
