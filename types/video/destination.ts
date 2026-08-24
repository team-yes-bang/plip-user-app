export type VideoDestinationKind = "TOPIC" | "DIARY";

export type VideoTopicDestination = {
  kind: "topic";
  agitUuid: string;
  topicUuid: string;
};

export type VideoDiaryDestination = {
  kind: "diary";
  /** Diary REST URL still uses numeric theme id. */
  themeId: string;
  /** Kafka / video destination body. */
  themeUuid: string;
};

export type VideoDestination = VideoTopicDestination | VideoDiaryDestination;

export type VideoDestinationPublishStatus = "accepted" | "not_wired";

export type VideoDestinationPublishResult = {
  status: VideoDestinationPublishStatus;
  videoUuid: string;
  destination: VideoDestination;
};
