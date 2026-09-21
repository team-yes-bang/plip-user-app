"use server";

import { ApiError } from "@/lib/api/apiFetch";
import { getServerUserUuid } from "@/lib/auth/server-token";
import { saveProfileImageFile } from "@/lib/user/saveProfileImage";
import * as agitService from "@/services/agitService";
import { notifyJoinOutcome } from "@/services/notificationService";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import { getApiErrorCode } from "@/lib/auth/auth-errors";
import type { ApiJoinAgitResponse } from "@/types/agit/api";
import { parseAgitNickname, parseCreateAgitInput, parseUpdateAgitInput } from "@/types/agit/schema";
import type { ApiDiscoverSort } from "@/types/agit/api";
import type { UiAgit, UiCreateAgitInput } from "@/types/agit/ui";

function joinAgitErrorMessage(error: ApiError): string {
  const code = getApiErrorCode(error.body);
  if (code === "ALREADY_JOINED") {
    return "이미 참여 중인 아지트입니다.";
  }
  if (code === "CAPACITY_FULL") {
    return "정원이 가득 찼어요.";
  }
  if (code === "MEMBER_BANNED") {
    return "이 아지트에서 내보내진 상태입니다.";
  }
  if (code === "JOIN_REQUEST_PENDING") {
    return "이미 입장 요청이 대기 중입니다.";
  }
  if (code === "INVALID_INVITE_CODE" || code === "AGIT_NOT_FOUND") {
    return "유효하지 않은 초대 코드입니다.";
  }
  if (error.status === 401) {
    return "로그인이 필요합니다.";
  }
  return `[${error.status}] ${error.message}`;
}

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return actionFailure(`[${error.status}] ${error.message}`);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("Unknown error");
}

export async function listMyAgitsAction(): Promise<ActionResult<UiAgit[]>> {
  try {
    const items = await agitService.listMyAgits();
    return actionSuccess(items);
  } catch (error) {
    return toActionError(error);
  }
}

export async function leaveAgitAction(agitId: string): Promise<ActionResult<void>> {
  try {
    await agitService.leaveAgit(agitId);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function banAgitMemberAction(
  agitId: string,
  ampId: number,
): Promise<ActionResult<void>> {
  try {
    await agitService.banAgitMember(agitId, ampId);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function transferAgitHostAction(
  agitId: string,
  ampId: number,
): Promise<ActionResult<void>> {
  try {
    await agitService.transferAgitHost(agitId, ampId);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

const DISCOVER_SEARCH_UNAVAILABLE =
  "랭킹·검색을 잠시 불러올 수 없어요. 잠시 후 다시 시도해 주세요.";

function toDiscoverSearchError(): ActionResult<never> {
  return actionFailure(DISCOVER_SEARCH_UNAVAILABLE);
}

export async function searchDiscoverAgitsAction(
  query: string,
  sort: ApiDiscoverSort,
): Promise<ActionResult<UiAgit[]>> {
  try {
    const items = await agitService.searchDiscoverAgits({
      q: query.trim() || undefined,
      sort,
    });
    return actionSuccess(items);
  } catch {
    return toDiscoverSearchError();
  }
}

export async function publishSearchMetricAction(
  type: string,
  agitUuid: string,
): Promise<ActionResult<void>> {
  try {
    await agitService.publishSearchMetric(type, agitUuid);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestJoinAgitAction(
  agitId: string,
  nickname: unknown,
): Promise<ActionResult<ApiJoinAgitResponse>> {
  const parsed = parseAgitNickname(nickname);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    const requested = await agitService.requestJoinAgit(agitId, { nickname: parsed.nickname });
    return actionSuccess(requested);
  } catch (error) {
    if (error instanceof ApiError) {
      return actionFailure(joinAgitErrorMessage(error));
    }
    return toActionError(error);
  }
}

type JoinDecisionNotify = {
  requesterUserUuid?: string;
  agitName?: string;
};

async function notifyJoinDecision(
  agitId: string,
  approved: boolean,
  notify?: JoinDecisionNotify,
): Promise<void> {
  const requesterUserUuid = notify?.requesterUserUuid?.trim();
  if (!requesterUserUuid) return;
  try {
    await notifyJoinOutcome({
      requesterUserUuid,
      agitId,
      agitName: notify?.agitName?.trim() || "아지트",
      approved,
    });
  } catch {
    // 승인/거절 자체는 성공. 알림 기록 실패는 무시.
  }
}

export async function approveJoinRequestAction(
  agitId: string,
  ampId: number,
  notify?: JoinDecisionNotify,
): Promise<ActionResult<void>> {
  try {
    await agitService.approveJoinRequest(agitId, ampId);
    await notifyJoinDecision(agitId, true, notify);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function rejectJoinRequestAction(
  agitId: string,
  ampId: number,
  notify?: JoinDecisionNotify,
): Promise<ActionResult<void>> {
  try {
    await agitService.rejectJoinRequest(agitId, ampId);
    await notifyJoinDecision(agitId, false, notify);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function joinAgitAction(
  code: string,
  nickname: unknown,
): Promise<ActionResult<ApiJoinAgitResponse>> {
  const parsed = parseAgitNickname(nickname);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    const joined = await agitService.joinAgitByCode(code, { nickname: parsed.nickname });
    return actionSuccess(joined);
  } catch (error) {
    if (error instanceof ApiError) {
      return actionFailure(joinAgitErrorMessage(error));
    }
    return toActionError(error);
  }
}

export async function createAgitAction(
  input: UiCreateAgitInput,
): Promise<ActionResult<UiAgit>> {
  const parsed = parseCreateAgitInput(input);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    const agit = await agitService.createAgit(parsed.data);
    return actionSuccess(agit);
  } catch (error) {
    return toActionError(error);
  }
}

export async function reissueInviteCodeAction(agitId: string): Promise<ActionResult<string>> {
  try {
    const code = await agitService.reissueInviteCode(agitId);
    return actionSuccess(code);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateAgitAction(
  agitId: string,
  input: {
    agitName: unknown;
    description?: unknown;
    maximumCapacity: unknown;
    thumbnailPath?: unknown;
  },
  minCapacity: number,
): Promise<ActionResult<UiAgit>> {
  const parsed = parseUpdateAgitInput(input, { minCapacity });
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    const agit = await agitService.updateAgit(agitId, parsed.data);
    return actionSuccess(agit);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMyAgitProfileAction(
  agitId: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  const nicknameValue = formData.get("nickname");
  const imageValue = formData.get("profileImage");
  const imageFile = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

  const parsed = parseAgitNickname(nicknameValue);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    const userUuid = await getServerUserUuid();
    if (!userUuid) {
      return actionFailure("로그인이 필요합니다.");
    }

    const detail = await agitService.getAgitAndMembers(agitId);
    const me = detail.members.find((member) => member.userUuid === userUuid);
    if (!me) {
      return actionFailure("멤버 정보를 확인할 수 없습니다.");
    }

    const nicknameChanged = parsed.nickname !== me.nickname;
    const profileImagePath = imageFile
      ? await saveProfileImageFile(userUuid, imageFile)
      : undefined;

    if (!nicknameChanged && !profileImagePath) {
      return actionFailure("변경 사항이 없습니다.");
    }

    await agitService.updateMyMemberProfile(agitId, {
      ...(nicknameChanged ? { nickname: parsed.nickname } : {}),
      ...(profileImagePath ? { profileImagePath } : {}),
    });
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
