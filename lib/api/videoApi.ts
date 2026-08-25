import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiFetch, apiFetchWithStatus } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import { getSessionAuthHeaders } from "@/lib/auth/server-token";
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

function videoFetch<T>(path: string, options: Parameters<typeof apiFetch>[1] = {}): Promise<T> {
  return withAuthRetry(async () =>
    apiFetch<T>(path, {
      baseUrl: getApiUrl(),
      headers: await getSessionAuthHeaders(),
      ...options,
    }),
  );
}

function videoFetchWithStatus<T>(
  path: string,
  options: Parameters<typeof apiFetchWithStatus>[1] = {},
): Promise<{ status: number; data: T }> {
  return withAuthRetry(async () =>
    apiFetchWithStatus<T>(path, {
      baseUrl: getApiUrl(),
      headers: await getSessionAuthHeaders(),
      ...options,
    }),
  );
}

/**
 * Actor identity comes from session headers (Authorization + X-User-UUID),
 * not query `userUuid` (gateway strips client-supplied identity).
 */
export async function postUploadUrl(
  contentType: string | undefined,
  contentLengthBytes: number,
): Promise<VideoUploadUrlResponse> {
  return videoFetch<VideoUploadUrlResponse>(API_ENDPOINTS.video.uploadUrl, {
    method: "POST",
    searchParams: {
      contentType,
      contentLengthBytes: String(contentLengthBytes),
    },
  });
}

export async function postComplete(
  videoUuid: string,
  request?: VideoCompleteRequest,
): Promise<VideoCompleteResponse> {
  return videoFetch<VideoCompleteResponse>(API_ENDPOINTS.video.complete(videoUuid), {
    method: "POST",
    body: request ?? {},
  });
}

export async function getVideoDetail(videoUuid: string): Promise<VideoDetailResponse> {
  return videoFetch<VideoDetailResponse>(API_ENDPOINTS.video.detail(videoUuid), {
    method: "GET",
  });
}

export async function postDestination(
  videoUuid: string,
  request: VideoDestinationRequest,
): Promise<{ status: number; body: VideoDestinationResponse }> {
  const { status, data } = await videoFetchWithStatus<VideoDestinationResponse>(
    API_ENDPOINTS.video.destination(videoUuid),
    {
      method: "POST",
      body: request,
    },
  );
  return { status, body: data };
}

export async function getDownloadUrl(videoUuid: string): Promise<VideoDownloadUrlResult> {
  const { status, data } = await videoFetchWithStatus<
    VideoDownloadUrlResponse | VideoDownloadUrlProcessingResponse
  >(API_ENDPOINTS.video.downloadUrl(videoUuid), {
    method: "GET",
  });

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
