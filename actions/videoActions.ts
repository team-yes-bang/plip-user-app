"use server";

import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type {
  VideoCompleteActionData,
  VideoDetailActionData,
  VideoDownloadUrlActionData,
  VideoUploadUrlActionData,
} from "@/types/video/action";
import { getVideoApiBaseUrl } from "@/lib/api/env";
import { ApiError } from "@/lib/api/apiFetch";
import { getServerUserUuid } from "@/lib/auth/server-token";
import { VIDEO_LOGIN_REQUIRED, VIDEO_SESSION_INVALID } from "@/lib/video/actionErrors";
import {
  toCompleteActionData,
  toDetailActionData,
  toDownloadUrlActionData,
  toUploadUrlActionData,
} from "@/lib/video/actionPayload";
import * as videoService from "@/services/videoService";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_CONTENT_TYPES = new Set(["video/mp4", "video/quicktime"]);

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

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return actionFailure(`[${error.status}] ${error.message}`);
  }

  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? error.cause.message : "";
    if (error.message.includes("fetch failed") || cause.includes("ECONNREFUSED")) {
      return actionFailure(
        `plip-video에 연결할 수 없습니다 (${getVideoApiBaseUrl()}). 백엔드 bootRun 여부를 확인하세요.`,
      );
    }

    return actionFailure(error.message);
  }

  return actionFailure("Unknown error");
}

export async function issueUploadUrlAction(
  contentType?: string,
): Promise<ActionResult<VideoUploadUrlActionData>> {
  const session = await requireSessionUserUuid();
  if (!session.ok) {
    return actionFailure(session.error);
  }

  const resolvedContentType = resolveContentType(contentType);
  if (!resolvedContentType) {
    return actionFailure("contentType must be video/mp4 or video/quicktime");
  }

  try {
    const data = await videoService.issueUploadUrl(session.userUuid, resolvedContentType);
    return actionSuccess(toUploadUrlActionData(data));
  } catch (error) {
    return toActionError(error);
  }
}

export async function completeVideoAction(
  videoUuid: string,
  caption?: string,
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

  try {
    const data = await videoService.completeVideo(
      resolvedVideoUuid,
      session.userUuid,
      normalizedCaption,
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
