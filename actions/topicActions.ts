"use server";

import { ApiError } from "@/lib/api/apiFetch";
import { getServerUserUuid } from "@/lib/auth/server-token";
import { TOPIC_FORBIDDEN, TOPIC_LOGIN_REQUIRED } from "@/lib/topic/actionErrors";
import * as topicService from "@/services/topicService";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type { ApiTopicListStatus } from "@/types/topic/api";
import { parseCreateTopicInput, parseUpdateTopicInput } from "@/types/topic/schema";
import type { UiTopicFeedWindow, UiTopicListItem, UiTopicVideo } from "@/types/topic/ui";
import { getAgitAndMembers } from "@/services/agitService";

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return actionFailure(TOPIC_FORBIDDEN);
    }
    return actionFailure(`[${error.status}] ${error.message}`);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("Unknown error");
}

async function requireLogin(): Promise<string | null> {
  const userUuid = await getServerUserUuid();
  return userUuid ? null : TOPIC_LOGIN_REQUIRED;
}

export async function listAgitTopicsAction(
  agitId: string,
): Promise<ActionResult<UiTopicListItem[]>> {
  const loginError = await requireLogin();
  if (loginError) {
    return actionFailure(loginError);
  }

  try {
    const items = await topicService.listTopics(agitId);
    return actionSuccess(items);
  } catch (error) {
    return toActionError(error);
  }
}

export async function listTopicsByStatusAction(
  agitId: string,
  status: ApiTopicListStatus,
  limit: number,
): Promise<ActionResult<UiTopicListItem[]>> {
  try {
    const items = await topicService.listTopicsByStatus(agitId, status, limit);
    return actionSuccess(items);
  } catch (error) {
    return toActionError(error);
  }
}

export async function createTopicAction(
  agitId: string,
  input: { title: unknown; startDate: unknown },
): Promise<ActionResult<void>> {
  const loginError = await requireLogin();
  if (loginError) {
    return actionFailure(loginError);
  }

  const parsed = parseCreateTopicInput(input);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    await topicService.createTopic({
      agitUuid: agitId,
      title: parsed.title,
      startAt: parsed.startAt,
    });
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateTopicAction(
  topicId: string,
  input: { title: unknown; startDate: unknown },
): Promise<ActionResult<void>> {
  const loginError = await requireLogin();
  if (loginError) {
    return actionFailure(loginError);
  }

  const parsed = parseUpdateTopicInput(input);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    await topicService.updateTopic(topicId, {
      title: parsed.title,
      startAt: parsed.startAt,
    });
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteTopicAction(topicId: string): Promise<ActionResult<void>> {
  const loginError = await requireLogin();
  if (loginError) {
    return actionFailure(loginError);
  }

  try {
    await topicService.deleteTopic(topicId);
    return actionSuccess(undefined);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return actionFailure("영상이 있는 토픽은 삭제할 수 없어요.");
    }
    return toActionError(error);
  }
}

export async function getTopicFeedWindowAction(
  agitId: string,
  input: { topicUuid?: string; date?: string; before?: number; after?: number },
): Promise<ActionResult<UiTopicFeedWindow>> {
  try {
    const window = await topicService.getTopicFeedWindow({
      agitUuid: agitId,
      topicUuid: input.topicUuid,
      date: input.date,
      before: input.before,
      after: input.after,
    });
    return actionSuccess(window);
  } catch (error) {
    return toActionError(error);
  }
}

export async function getTopicVideosAction(
  agitId: string,
  topicUuid: string,
): Promise<ActionResult<UiTopicVideo[]>> {
  try {
    const detail = await getAgitAndMembers(agitId);
    const videos = await topicService.getTopicVideos(topicUuid, detail.members);
    return actionSuccess(videos);
  } catch (error) {
    return toActionError(error);
  }
}
