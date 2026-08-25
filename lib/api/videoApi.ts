import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiFetch, apiFetchWithStatus } from "@/lib/api/apiFetch";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type {
  VideoCompleteRequest,
  VideoCompleteResponse,
  VideoDestinationRequest,
  VideoDestinationResponse,
  VideoDetailResponse,
  VideoDownloadUrlProcessingResponse,
  VideoDownloadUrlResponse,
  VideoDownloadUrlResult,
  VideoUploadUrlResponse,
} from "@/types/video/api";

/**
 * Actor identity comes from session headers (Authorization + X-User-UUID),
 * not query `userUuid` (gateway strips client-supplied identity).
 */
export async function postUploadUrl(
  contentType: string | undefined,
  contentLengthBytes: number,
): Promise<VideoUploadUrlResponse> {
  return withAuthRetry(() =>
    apiFetch<VideoUploadUrlResponse>(API_ENDPOINTS.video.uploadUrl, {
      method: "POST",
      searchParams: {
        contentType,
        contentLengthBytes: String(contentLengthBytes),
      },
    }),
  );
}

export async function postComplete(
  videoUuid: string,
  request?: VideoCompleteRequest,
): Promise<VideoCompleteResponse> {
  return withAuthRetry(() =>
    apiFetch<VideoCompleteResponse>(API_ENDPOINTS.video.complete(videoUuid), {
      method: "POST",
      body: request ?? {},
    }),
  );
}

export async function getVideoDetail(videoUuid: string): Promise<VideoDetailResponse> {
  return withAuthRetry(() =>
    apiFetch<VideoDetailResponse>(API_ENDPOINTS.video.detail(videoUuid), {
      method: "GET",
    }),
  );
}

export async function postDestination(
  videoUuid: string,
  request: VideoDestinationRequest,
): Promise<{ status: number; body: VideoDestinationResponse }> {
  const { status, data } = await withAuthRetry(() =>
    apiFetchWithStatus<VideoDestinationResponse>(API_ENDPOINTS.video.destination(videoUuid), {
      method: "POST",
      body: request,
    }),
  );
  return { status, body: data };
}

export async function getDownloadUrl(videoUuid: string): Promise<VideoDownloadUrlResult> {
  const { status, data } = await withAuthRetry(() =>
    apiFetchWithStatus<VideoDownloadUrlResponse | VideoDownloadUrlProcessingResponse>(
      API_ENDPOINTS.video.downloadUrl(videoUuid),
      {
        method: "GET",
      },
    ),
  );

  if (status === 202) {
    return {
      kind: "processing",
      body: data as VideoDownloadUrlProcessingResponse,
    };
  }

  return {
    kind: "ready",
    body: data as VideoDownloadUrlResponse,
  };
}
