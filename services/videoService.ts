import * as videoApi from "@/lib/api/videoApi";
import { parseUploadedAtToDate } from "@/lib/video/formatOverlayClock";
import type {
  VideoCompleteResponse,
  VideoDestinationRequest,
  VideoDestinationResponse,
  VideoDetailResponse,
  VideoDownloadUrlResult,
  VideoThumbnailUploadUrlResponse,
  VideoUploadUrlResponse,
} from "@/types/video/api";
import type {
  VideoCompleteUi,
  VideoDetailUi,
  VideoDownloadUrlUi,
  VideoThumbnailUploadUrlUi,
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

function mapThumbnailUploadUrl(api: VideoThumbnailUploadUrlResponse): VideoThumbnailUploadUrlUi {
  return {
    videoUuid: api.videoUuid,
    thumbnailS3Key: api.thumbnailS3Key,
    uploadUrl: api.uploadUrl,
    expiresAt: new Date(api.expiresAt),
  };
}

function mapComplete(api: VideoCompleteResponse): VideoCompleteUi {
  return {
    videoUuid: api.videoUuid,
    caption: api.caption,
    createdAt: parseUploadedAtToDate(api.createdAt),
    overlayTime: api.overlayTime,
  };
}

function mapDetail(api: VideoDetailResponse): VideoDetailUi {
  return {
    videoUuid: api.videoUuid,
    userUuid: api.userUuid,
    caption: api.caption,
    createdAt: parseUploadedAtToDate(api.createdAt),
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
  contentType: string | undefined,
  contentLengthBytes: number,
): Promise<VideoUploadUrlUi> {
  const response = await videoApi.postUploadUrl(contentType, contentLengthBytes);
  return mapUploadUrl(response);
}

export async function issueThumbnailUploadUrl(
  videoUuid: string,
  contentType: string | undefined,
  contentLengthBytes: number,
): Promise<VideoThumbnailUploadUrlUi> {
  const response = await videoApi.postThumbnailUploadUrl(
    videoUuid,
    contentType,
    contentLengthBytes,
  );
  return mapThumbnailUploadUrl(response);
}

export async function completeVideo(
  videoUuid: string,
  caption?: string,
  thumbnailS3Key?: string,
): Promise<VideoCompleteUi> {
  const response = await videoApi.postComplete(videoUuid, {
    caption,
    ...(thumbnailS3Key ? { thumbnailS3Key } : {}),
  });
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
): Promise<VideoDestinationResponse> {
  const { body } = await videoApi.postDestination(videoUuid, request);
  return body;
}
