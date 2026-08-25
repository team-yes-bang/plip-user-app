"use server";

import { ApiError } from "@/lib/api/apiFetch";
import { getServerUserUuid } from "@/lib/auth/server-token";
import * as chatService from "@/services/chatService";
import { getAgitAndMembers } from "@/services/agitService";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type { UiChatHistory } from "@/types/chat/ui";

const CHAT_LOGIN_REQUIRED = "로그인이 필요합니다.";
const CHAT_FORBIDDEN = "채팅을 볼 수 있는 권한이 없습니다.";

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return actionFailure(CHAT_LOGIN_REQUIRED);
    }
    if (error.status === 403) {
      return actionFailure(CHAT_FORBIDDEN);
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
  return userUuid ? null : CHAT_LOGIN_REQUIRED;
}

type ChatHistoryCursor = {
  cursorCreatedAt: string;
  cursorId: string;
};

export async function getChatHistoryAction(
  agitId: string,
  cursor?: ChatHistoryCursor,
  size = 20,
): Promise<ActionResult<UiChatHistory>> {
  const loginError = await requireLogin();
  if (loginError) {
    return actionFailure(loginError);
  }

  try {
    const currentUserUuid = await getServerUserUuid();
    const { members } = await getAgitAndMembers(agitId);
    const history = await chatService.getChatHistory(agitId, {
      members,
      currentUserUuid,
      cursorCreatedAt: cursor?.cursorCreatedAt,
      cursorId: cursor?.cursorId,
      size,
    });
    return actionSuccess(history);
  } catch (error) {
    return toActionError(error);
  }
}

export async function markChatReadAction(agitId: string): Promise<ActionResult<void>> {
  const loginError = await requireLogin();
  if (loginError) {
    return actionFailure(loginError);
  }

  try {
    await chatService.markChatRead(agitId);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
