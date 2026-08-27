export type VideoUploadUrlUi = {
  videoUuid: string;
  rawS3Key: string;
  uploadUrl: string;
  expiresAt: Date;
};

export type VideoThumbnailUploadUrlUi = {
  videoUuid: string;
  thumbnailS3Key: string;
  uploadUrl: string;
  expiresAt: Date;
};

export type VideoCompleteUi = {
  videoUuid: string;
  caption: string | null;
  createdAt: Date;
  overlayTime: string;
};

export type VideoDetailUi = {
  videoUuid: string;
  userUuid: string;
  caption: string | null;
  createdAt: Date;
  rawPlaybackUrl: string;
  thumbnailUrl: string | null;
  overlayTime: string;
  downloadReady: boolean;
};

export type VideoDownloadUrlUi =
  | { status: "ready"; videoUuid: string; downloadUrl: string }
  | {
      status: "processing";
      videoUuid: string;
      retryAfterSeconds: number;
      message: string;
    };

export type CaptureFlowPhase =
  | "initializing"
  | "ready"
  | "recording"
  | "preview"
  | "uploading"
  | "complete"
  | "error";
