"use server";

import { ApiError } from "@/lib/api/apiFetch";
import * as agitService from "@/services/agitService";
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
  } catch (error) {
    return toActionError(error);
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

export async function approveJoinRequestAction(
  agitId: string,
  ampId: number,
): Promise<ActionResult<void>> {
  try {
    await agitService.approveJoinRequest(agitId, ampId);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function rejectJoinRequestAction(
  agitId: string,
  ampId: number,
): Promise<ActionResult<void>> {
  try {
    await agitService.rejectJoinRequest(agitId, ampId);
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
  nickname: unknown,
): Promise<ActionResult<void>> {
  const parsed = parseAgitNickname(nickname);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    await agitService.updateMyMemberProfile(agitId, { nickname: parsed.nickname });
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
