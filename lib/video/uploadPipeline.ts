import {
  completeVideoAction,
  getVideoAction,
  issueThumbnailUploadUrlAction,
  issueUploadUrlAction,
} from "@/actions/videoActions";
import { extractActionFailure } from "@/lib/video/actionPayload";
import { VideoSessionExpiredError } from "@/lib/video/actionErrors";
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
  payload: { ok: true; data: T } | { ok: false; error: string; sessionExpired?: boolean },
  fallbackMessage: string,
): asserts payload is { ok: true; data: T } {
  if (payload.ok) {
    return;
  }

  if (payload.sessionExpired) {
    throw new VideoSessionExpiredError();
  }

  throw new Error(payload.error || fallbackMessage);
}

async function uploadThumbnailBestEffort(
  videoUuid: string,
  thumbnail: Blob,
): Promise<string | undefined> {
  const contentType = thumbnail.type || THUMBNAIL_CONTENT_TYPE;
  const issued = await issueThumbnailUploadUrlAction(videoUuid, contentType, thumbnail.size);
  if (!issued.ok) {
    if (issued.sessionExpired) {
      throw new VideoSessionExpiredError();
    }

    const issuedError = issued.error;
    if (issuedError.includes("[404]")) {
      console.warn(
        "thumbnail-upload-url unavailable; continuing without client thumbnail (Lambda will generate)",
      );
      return undefined;
    }

    throw new Error(issuedError ?? "thumbnail-upload-url failed");
  }

  await putPresignedUpload(issued.data.uploadUrl, thumbnail, contentType);
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

  const completeResult = await completeVideoAction(videoUuid, options?.caption, thumbnailS3Key);
  assertActionSuccess(completeResult, "complete failed");

  const detailResult = await getVideoAction(videoUuid);
  assertActionSuccess(detailResult, "get video failed");

  return {
    videoUuid,
    putResult,
    complete: completeResult.data,
    detail: detailResult.data,
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
  const poll = await pollDownloadUrl(base.videoUuid);

  return {
    ...base,
    download: poll.data,
    downloadPollAttempts: poll.attempts,
    playback: resolvePlaybackSource(options?.localPreviewUrl, base.detail.rawPlaybackUrl),
  };
}
