import {
  completeVideoAction,
  getVideoAction,
  issueThumbnailUploadUrlAction,
  issueUploadUrlAction,
} from "@/actions/videoActions";
import { THUMBNAIL_CONTENT_TYPE } from "@/lib/video/constants";
import { pollDownloadUrl } from "@/lib/video/downloadUrlPoll";
import { resolvePlaybackSource, type PlaybackSource } from "@/lib/video/playback";
import { preparePlaybackMp4IfNeeded } from "@/lib/video/preparePlaybackMp4";
import { putPresignedUpload } from "@/lib/video/putPresigned";
import { resolveUploadContentType } from "@/lib/video/recorderMime";
import { assertUploadSize } from "@/lib/video/uploadLimits";
import type {
  VideoCompleteActionData,
  VideoDetailActionData,
  VideoDownloadUrlActionData,
} from "@/types/video/action";
import type { ActionResult } from "@/types/action-result";

export type VideoUploadPipelineResult = {
  videoUuid: string;
  putResult: "uploaded" | "skipped-stub";
  complete: VideoCompleteActionData;
  detail: VideoDetailActionData;
};

export type Phase0FUploadResult = VideoUploadPipelineResult & {
  download: VideoDownloadUrlActionData;
  downloadPollAttempts: number;
  playback: PlaybackSource;
};

function assertActionSuccess<T>(
  payload: { ok: true; data: T } | { ok: false; error: string },
  fallbackMessage: string,
): asserts payload is { ok: true; data: T } {
  if (!payload.ok) {
    throw new Error(payload.error || fallbackMessage);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isRetryableCompleteError(error: string): boolean {
  const normalized = error.toLowerCase();
  return (
    normalized.includes("raw video not found") ||
    normalized.includes("not found in s3")
  );
}

function detailFromComplete(complete: VideoCompleteActionData): VideoDetailActionData {
  return {
    videoUuid: complete.videoUuid,
    userUuid: "",
    caption: complete.caption,
    createdAt: complete.createdAt,
    rawPlaybackUrl: "",
    thumbnailUrl: null,
    overlayTime: complete.overlayTime,
    downloadReady: false,
  };
}

function processingDownloadState(videoUuid: string): VideoDownloadUrlActionData {
  return {
    status: "processing",
    videoUuid,
    retryAfterSeconds: 3,
    message: "영상 처리 중입니다.",
  };
}

async function completeVideoWithRetry(
  videoUuid: string,
  caption?: string,
  thumbnailS3Key?: string,
): Promise<ActionResult<VideoCompleteActionData>> {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await completeVideoAction(videoUuid, caption, thumbnailS3Key);
    if (result.ok) {
      return result;
    }

    if (isRetryableCompleteError(result.error) && attempt < maxAttempts) {
      await wait(750 * attempt);
      continue;
    }

    return result;
  }

  return completeVideoAction(videoUuid, caption, thumbnailS3Key);
}

async function uploadThumbnailBestEffort(
  videoUuid: string,
  thumbnail: Blob,
): Promise<string | undefined> {
  const contentType = thumbnail.type || THUMBNAIL_CONTENT_TYPE;
  const issued = await issueThumbnailUploadUrlAction(videoUuid, contentType, thumbnail.size);
  if (!issued.ok) {
    const issuedError = issued.error;
    if (issuedError.includes("[404]") || issuedError.includes("401")) {
      console.warn(
        "thumbnail-upload-url unavailable or unauthorized; continuing without client thumbnail",
      );
      return undefined;
    }

    throw new Error(issuedError ?? "thumbnail-upload-url failed");
  }

  try {
    await putPresignedUpload(issued.data.uploadUrl, thumbnail, contentType);
  } catch (error) {
    console.warn("thumbnail PUT failed; continuing without client thumbnail", error);
    return undefined;
  }

  return issued.data.thumbnailS3Key;
}

export async function uploadRecordedVideo(
  blob: Blob,
  options?: { caption?: string; recorderMimeType?: string; thumbnail?: Blob },
): Promise<VideoUploadPipelineResult> {
  const prepared = await preparePlaybackMp4IfNeeded(blob);
  assertUploadSize(prepared);

  const contentType = resolveUploadContentType(prepared.type || options?.recorderMimeType);

  const uploadUrlResult = await issueUploadUrlAction(contentType, prepared.size);
  assertActionSuccess(uploadUrlResult, "upload-url failed");

  const { videoUuid, uploadUrl } = uploadUrlResult.data;
  const thumbnail = options?.thumbnail;

  const putResult = await putPresignedUpload(uploadUrl, prepared, contentType);
  const thumbnailS3Key =
    thumbnail && thumbnail.size > 0
      ? await uploadThumbnailBestEffort(videoUuid, thumbnail)
      : undefined;

  const completeResult = await completeVideoWithRetry(videoUuid, options?.caption, thumbnailS3Key);
  assertActionSuccess(completeResult, "complete failed");

  const detailResult = await getVideoAction(videoUuid);
  const detail = detailResult.ok
    ? detailResult.data
    : detailFromComplete(completeResult.data);

  return {
    videoUuid,
    putResult,
    complete: completeResult.data,
    detail,
  };
}

/** Phase 0-F E2E: upload-url → PUT → complete → GET → download-url poll */
export async function runPhase0FUpload(
  blob: Blob,
  options?: {
    caption?: string;
    recorderMimeType?: string;
    localPreviewUrl?: string | null;
    thumbnail?: Blob;
  },
): Promise<Phase0FUploadResult> {
  const base = await uploadRecordedVideo(blob, options);

  let download = processingDownloadState(base.videoUuid);
  let downloadPollAttempts = 0;

  try {
    const poll = await pollDownloadUrl(base.videoUuid);
    download = poll.data;
    downloadPollAttempts = poll.attempts;
  } catch (error) {
    console.warn("download-url poll failed after complete; upload is still saved", error);
  }

  return {
    ...base,
    download,
    downloadPollAttempts,
    playback: resolvePlaybackSource(options?.localPreviewUrl, base.detail.rawPlaybackUrl),
  };
}
