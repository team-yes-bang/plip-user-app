import * as videoApi from "@/lib/api/videoApi";
import type {
  VideoCompleteResponse,
  VideoDestinationRequest,
  VideoDetailResponse,
  VideoDownloadUrlResult,
  VideoUploadUrlResponse,
} from "@/types/video/api";
import type {
  VideoCompleteUi,
  VideoDetailUi,
  VideoDownloadUrlUi,
  VideoUploadUrlUi,
} from "@/types/video/ui";

function mapUploadUrl(api: VideoUploadUrlResponse): VideoUploadUrlUi {
  return {
    videoUuid: api.videoUuid,
    rawS3Key: api.rawS3Key,
    uploadUrl: api.uploadUrl,
    expiresAt: new Date(api.expiresAt),
  };
}

function mapComplete(api: VideoCompleteResponse): VideoCompleteUi {
  return {
    videoUuid: api.videoUuid,
    caption: api.caption,
    createdAt: new Date(api.createdAt),
    overlayTime: api.overlayTime,
  };
}

function mapDetail(api: VideoDetailResponse): VideoDetailUi {
  return {
    videoUuid: api.videoUuid,
    userUuid: api.userUuid,
    caption: api.caption,
    createdAt: new Date(api.createdAt),
    rawPlaybackUrl: api.rawPlaybackUrl,
    thumbnailUrl: api.thumbnailUrl,
    overlayTime: api.overlayTime,
    downloadReady: api.downloadReady,
  };
}

function mapDownloadUrl(result: VideoDownloadUrlResult): VideoDownloadUrlUi {
  if (result.kind === "processing") {
    return {
      status: "processing",
      videoUuid: result.body.videoUuid,
      retryAfterSeconds: result.body.retryAfterSeconds,
      message: result.body.message,
    };
  }

  return {
    status: "ready",
    videoUuid: result.body.videoUuid,
    downloadUrl: result.body.downloadUrl,
  };
}

export async function issueUploadUrl(
  userUuid: string,
  contentType?: string,
): Promise<VideoUploadUrlUi> {
  const response = await videoApi.postUploadUrl(userUuid, contentType);
  return mapUploadUrl(response);
}

export async function completeVideo(
  videoUuid: string,
  userUuid: string,
  caption?: string,
): Promise<VideoCompleteUi> {
  const response = await videoApi.postComplete(videoUuid, userUuid, { caption });
  return mapComplete(response);
}

export async function getVideoDetail(videoUuid: string): Promise<VideoDetailUi> {
  const response = await videoApi.getVideoDetail(videoUuid);
  return mapDetail(response);
}

export async function getDownloadUrl(videoUuid: string): Promise<VideoDownloadUrlUi> {
  const response = await videoApi.getDownloadUrl(videoUuid);
  return mapDownloadUrl(response);
}

export async function publishDestination(
  videoUuid: string,
  request: VideoDestinationRequest,
): Promise<void> {
  await videoApi.postDestination(videoUuid, request);
}
