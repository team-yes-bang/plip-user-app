/** Server Action → Client 직렬화용 (Date 금지) */

export type VideoUploadUrlActionData = {
  videoUuid: string;
  rawS3Key: string;
  uploadUrl: string;
  expiresAt: string;
};

export type VideoCompleteActionData = {
  videoUuid: string;
  caption: string | null;
  createdAt: string;
  overlayTime: string;
};

export type VideoDetailActionData = {
  videoUuid: string;
  userUuid: string;
  caption: string | null;
  createdAt: string;
  rawPlaybackUrl: string;
  thumbnailUrl: string | null;
  overlayTime: string;
  downloadReady: boolean;
};

export type VideoDestinationActionData = {
  status: "accepted" | "not_wired";
  videoUuid: string;
} & (
  | { kind: "TOPIC"; topicUuid: string; agitUuid: string }
  | { kind: "DIARY"; themeUuid: string }
);

export type VideoDownloadUrlActionData =
  | { status: "ready"; videoUuid: string; downloadUrl: string }
  | {
      status: "processing";
      videoUuid: string;
      retryAfterSeconds: number;
      message: string;
    };
