import type {
  VideoCompleteActionData,
  VideoDetailActionData,
  VideoDownloadUrlActionData,
  VideoUploadUrlActionData,
} from "@/types/video/action";
import type {
  VideoCompleteUi,
  VideoDetailUi,
  VideoDownloadUrlUi,
  VideoUploadUrlUi,
} from "@/types/video/ui";

export function toUploadUrlActionData(data: VideoUploadUrlUi): VideoUploadUrlActionData {
  return {
    videoUuid: data.videoUuid,
    rawS3Key: data.rawS3Key,
    uploadUrl: data.uploadUrl,
    expiresAt: data.expiresAt.toISOString(),
  };
}

export function toCompleteActionData(data: VideoCompleteUi): VideoCompleteActionData {
  return {
    videoUuid: data.videoUuid,
    caption: data.caption,
    createdAt: data.createdAt.toISOString(),
    overlayTime: data.overlayTime,
  };
}

export function toDetailActionData(data: VideoDetailUi): VideoDetailActionData {
  return {
    videoUuid: data.videoUuid,
    userUuid: data.userUuid,
    caption: data.caption,
    createdAt: data.createdAt.toISOString(),
    rawPlaybackUrl: data.rawPlaybackUrl,
    thumbnailUrl: data.thumbnailUrl,
    overlayTime: data.overlayTime,
    downloadReady: data.downloadReady,
  };
}

export function toDownloadUrlActionData(data: VideoDownloadUrlUi): VideoDownloadUrlActionData {
  if (data.status === "ready") {
    return {
      status: "ready",
      videoUuid: data.videoUuid,
      downloadUrl: data.downloadUrl,
    };
  }

  return {
    status: "processing",
    videoUuid: data.videoUuid,
    retryAfterSeconds: data.retryAfterSeconds,
    message: data.message,
  };
}

export function extractUploadUrlFromActionResult(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (!("ok" in payload) || payload.ok !== true) {
    return null;
  }

  if (!("data" in payload) || !payload.data || typeof payload.data !== "object") {
    return null;
  }

  const data = payload.data as Record<string, unknown>;
  if (typeof data.uploadUrl !== "string") {
    return null;
  }

  const trimmed = data.uploadUrl.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function extractVideoUuidFromActionResult(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (!("ok" in payload) || payload.ok !== true) {
    return null;
  }

  if (!("data" in payload) || !payload.data || typeof payload.data !== "object") {
    return null;
  }

  const data = payload.data as Record<string, unknown>;
  if (typeof data.videoUuid !== "string") {
    return null;
  }

  const trimmed = data.videoUuid.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function extractActionError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (!("ok" in payload) || payload.ok !== false) {
    return null;
  }

  if (!("error" in payload) || typeof payload.error !== "string") {
    return "Unknown error";
  }

  return payload.error;
}
