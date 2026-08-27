"use server";

import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type {
  VideoCompleteActionData,
  VideoDestinationActionData,
  VideoDetailActionData,
  VideoDownloadUrlActionData,
  VideoThumbnailUploadUrlActionData,
  VideoUploadUrlActionData,
} from "@/types/video/action";
import type { VideoDestinationRequest } from "@/types/video/api";
import type { VideoDestination } from "@/types/video/destination";
import { getApiUrl, isVideoDestinationNotWiredFallbackEnabled } from "@/lib/api/env";
import { ApiError } from "@/lib/api/apiFetch";
import { getServerUserUuid } from "@/lib/auth/server-token";
import {
  VIDEO_DESTINATION_INVALID,
  VIDEO_LOGIN_REQUIRED,
  VIDEO_SESSION_INVALID,
} from "@/lib/video/actionErrors";
import {
  toCompleteActionData,
  toDetailActionData,
  toDownloadUrlActionData,
  toThumbnailUploadUrlActionData,
  toUploadUrlActionData,
} from "@/lib/video/actionPayload";
import * as videoService from "@/services/videoService";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_CONTENT_TYPES = new Set(["video/mp4", "video/quicktime"]);
const ALLOWED_THUMBNAIL_CONTENT_TYPES = new Set(["image/jpeg"]);
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;

async function requireSessionUserUuid(): Promise<
  { ok: true; userUuid: string } | { ok: false; error: string }
> {
  const userUuid = await getServerUserUuid();
  if (!userUuid) {
    return { ok: false, error: VIDEO_LOGIN_REQUIRED };
  }

  if (!UUID_PATTERN.test(userUuid)) {
    return { ok: false, error: VIDEO_SESSION_INVALID };
  }

  return { ok: true, userUuid };
}

function resolveVideoUuid(videoUuid: string): string | null {
  const trimmed = videoUuid.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}

function resolveContentType(contentType?: string): string | undefined {
  if (!contentType?.trim()) {
    return "video/mp4";
  }

  const normalized = contentType.trim().toLowerCase();
  return ALLOWED_CONTENT_TYPES.has(normalized) ? normalized : undefined;
}

function resolveThumbnailContentType(contentType?: string): string | undefined {
  if (!contentType?.trim()) {
    return "image/jpeg";
  }

  const normalized = contentType.trim().toLowerCase();
  return ALLOWED_THUMBNAIL_CONTENT_TYPES.has(normalized) ? normalized : undefined;
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return actionFailure(`[${error.status}] ${error.message}`);
  }

  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? error.cause.message : "";
    if (error.message.includes("fetch failed") || cause.includes("ECONNREFUSED")) {
      return actionFailure(
        `plip-video에 연결할 수 없습니다 (${getApiUrl()}). gateway·video-service bootRun 여부를 확인하세요.`,
      );
    }

    return actionFailure(error.message);
  }

  return actionFailure("Unknown error");
}

export async function issueUploadUrlAction(
  contentType: string | undefined,
  contentLengthBytes: number,
): Promise<ActionResult<VideoUploadUrlActionData>> {
  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const resolvedContentType = resolveContentType(contentType);
  if (!resolvedContentType) {
    return actionFailure("contentType must be video/mp4 or video/quicktime");
  }

  if (!Number.isFinite(contentLengthBytes) || contentLengthBytes <= 0) {
    return actionFailure("contentLengthBytes must be a positive number");
  }

  try {
    const data = await videoService.issueUploadUrl(
      resolvedContentType,
      contentLengthBytes,
    );
    return actionSuccess(toUploadUrlActionData(data));
  } catch (error) {
    return toActionError(error);
  }
}

export async function issueThumbnailUploadUrlAction(
  videoUuid: string,
  contentType: string | undefined,
  contentLengthBytes: number,
): Promise<ActionResult<VideoThumbnailUploadUrlActionData>> {
  const resolvedVideoUuid = resolveVideoUuid(videoUuid);
  if (!resolvedVideoUuid) {
    return actionFailure("Invalid videoUuid");
  }

  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const resolvedContentType = resolveThumbnailContentType(contentType);
  if (!resolvedContentType) {
    return actionFailure("contentType must be image/jpeg");
  }

  if (!Number.isFinite(contentLengthBytes) || contentLengthBytes <= 0) {
    return actionFailure("contentLengthBytes must be a positive number");
  }

  if (contentLengthBytes > MAX_THUMBNAIL_BYTES) {
    return actionFailure("thumbnail must be 2MB or smaller");
  }

  try {
    const data = await videoService.issueThumbnailUploadUrl(
      resolvedVideoUuid,
      resolvedContentType,
      contentLengthBytes,
    );
    return actionSuccess(toThumbnailUploadUrlActionData(data));
  } catch (error) {
    return toActionError(error);
  }
}

export async function completeVideoAction(
  videoUuid: string,
  caption?: string,
  thumbnailS3Key?: string,
): Promise<ActionResult<VideoCompleteActionData>> {
  const resolvedVideoUuid = resolveVideoUuid(videoUuid);
  if (!resolvedVideoUuid) {
    return actionFailure("Invalid videoUuid");
  }

  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const normalizedCaption = caption?.trim() || undefined;
  const normalizedThumbnailS3Key = thumbnailS3Key?.trim() || undefined;

  try {
    const data = await videoService.completeVideo(
      resolvedVideoUuid,
      normalizedCaption,
      normalizedThumbnailS3Key,
    );
    return actionSuccess(toCompleteActionData(data));
  } catch (error) {
    return toActionError(error);
  }
}

export async function getVideoAction(
  videoUuid: string,
): Promise<ActionResult<VideoDetailActionData>> {
  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const resolvedVideoUuid = resolveVideoUuid(videoUuid);
  if (!resolvedVideoUuid) {
    return actionFailure("Invalid videoUuid");
  }

  try {
    const data = await videoService.getVideoDetail(resolvedVideoUuid);
    return actionSuccess(toDetailActionData(data));
  } catch (error) {
    return toActionError(error);
  }
}

function toDestinationPayload(destination: VideoDestination): VideoDestinationRequest | null {
  if (destination.kind === "topic") {
    const agitUuid = destination.agitUuid.trim();
    const topicUuid = destination.topicUuid.trim();
    if (!UUID_PATTERN.test(agitUuid) || !UUID_PATTERN.test(topicUuid)) {
      return null;
    }
    return { kind: "TOPIC", topicUuid, agitUuid };
  }

  const themeUuid = destination.themeUuid.trim();
  if (!UUID_PATTERN.test(themeUuid)) {
    return null;
  }

  return { kind: "DIARY", themeUuid };
}

export async function publishVideoDestinationAction(
  videoUuid: string,
  destination: VideoDestination,
  caption?: string,
): Promise<ActionResult<VideoDestinationActionData>> {
  const resolvedVideoUuid = resolveVideoUuid(videoUuid);
  if (!resolvedVideoUuid) {
    return actionFailure("Invalid videoUuid");
  }

  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const payload = toDestinationPayload(destination);
  if (!payload) {
    return actionFailure(VIDEO_DESTINATION_INVALID);
  }

  const data: VideoDestinationActionData = {
    status: "accepted",
    videoUuid: resolvedVideoUuid,
    ...payload,
  };

  try {
    await videoService.publishDestination(resolvedVideoUuid, {
      ...payload,
      caption: caption?.trim() || undefined,
    });
    return actionSuccess({ ...data, status: "accepted" });
  } catch (error) {
    if (
      isVideoDestinationNotWiredFallbackEnabled() &&
      error instanceof ApiError &&
      (error.status === 404 || error.status === 501)
    ) {
      // Kafka/destination API 미연동 환경. 업로드 complete는 이미 끝난 상태.
      return actionSuccess({ ...data, status: "not_wired" });
    }

    return toActionError(error);
  }
}

export async function getDownloadUrlAction(
  videoUuid: string,
): Promise<ActionResult<VideoDownloadUrlActionData>> {
  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const resolvedVideoUuid = resolveVideoUuid(videoUuid);
  if (!resolvedVideoUuid) {
    return actionFailure("Invalid videoUuid");
  }

  try {
    const data = await videoService.getDownloadUrl(resolvedVideoUuid);
    return actionSuccess(toDownloadUrlActionData(data));
  } catch (error) {
    return toActionError(error);
  }
}
