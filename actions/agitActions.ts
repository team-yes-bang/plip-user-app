"use server";

import { ApiError } from "@/lib/api/apiFetch";
import * as agitService from "@/services/agitService";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import { parseAgitNickname, parseCreateAgitInput, parseUpdateAgitInput } from "@/types/agit/schema";
import type { UiAgit, UiCreateAgitInput } from "@/types/agit/ui";

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return actionFailure(`[${error.status}] ${error.message}`);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("Unknown error");
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
