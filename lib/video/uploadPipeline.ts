import {
  completeVideoAction,
  getVideoAction,
  issueUploadUrlAction,
} from "@/actions/videoActions";
import { extractActionError } from "@/lib/video/actionPayload";
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

export async function uploadRecordedVideo(
  blob: Blob,
  options?: { caption?: string; recorderMimeType?: string },
): Promise<VideoUploadPipelineResult> {
  const prepared = await preparePlaybackMp4IfNeeded(blob);
  assertUploadSize(prepared);

  const contentType = resolveUploadContentType(prepared.type || options?.recorderMimeType);

  const uploadUrlResult = await issueUploadUrlAction(contentType, prepared.size);
  const uploadUrlError = extractActionError(uploadUrlResult);
  if (uploadUrlError || !uploadUrlResult.ok) {
    throw new Error(uploadUrlError ?? "upload-url failed");
  }

  const { videoUuid, uploadUrl } = uploadUrlResult.data;
  const putResult = await putPresignedUpload(uploadUrl, prepared, contentType);

  const completeResult = await completeVideoAction(videoUuid, options?.caption);
  const completeError = extractActionError(completeResult);
  if (completeError || !completeResult.ok) {
    throw new Error(completeError ?? "complete failed");
  }

  const detailResult = await getVideoAction(videoUuid);
  const detailError = extractActionError(detailResult);
  if (detailError || !detailResult.ok) {
    throw new Error(detailError ?? "get video failed");
  }

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
