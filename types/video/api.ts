/** plip-video REST DTO mirrors (com.plip.video.adapter.in.web.dto) */

export type VideoUploadUrlResponse = {
  videoUuid: string;
  rawS3Key: string;
  uploadUrl: string;
  expiresAt: string;
};

export type VideoCompleteRequest = {
  caption?: string | null;
};

export type VideoTopicDestinationRequest = {
  kind: "TOPIC";
  topicUuid: string;
  agitUuid: string;
  caption?: string;
};

export type VideoDiaryDestinationRequest = {
  kind: "DIARY";
  themeUuid: string;
  caption?: string;
};

export type VideoDestinationRequest = VideoTopicDestinationRequest | VideoDiaryDestinationRequest;

export type VideoDestinationResponse = {
  videoUuid: string;
  status?: "PUBLISHED" | "accepted";
  accepted?: boolean;
};

export type VideoCompleteResponse = {
  videoUuid: string;
  caption: string | null;
  createdAt: string;
  overlayTime: string;
};

export type VideoDetailResponse = {
  videoUuid: string;
  userUuid: string;
  caption: string | null;
  createdAt: string;
  rawPlaybackUrl: string;
  thumbnailUrl: string | null;
  overlayTime: string;
  downloadReady: boolean;
};

export type VideoDownloadUrlResponse = {
  videoUuid: string;
  downloadUrl: string;
};

export type VideoDownloadUrlProcessingResponse = {
  status: "PROCESSING";
  videoUuid: string;
  retryAfterSeconds: number;
  message: string;
};

export type VideoDownloadUrlResult =
  | { kind: "ready"; body: VideoDownloadUrlResponse }
  | { kind: "processing"; body: VideoDownloadUrlProcessingResponse };
