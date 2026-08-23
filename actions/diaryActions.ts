"use server";

import { ApiError } from "@/lib/api/apiFetch";
import * as diaryService from "@/services/diaryService";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import { parseThemeId, parseThemeName, parseDiaryDateParam } from "@/types/diary/schema";
import type { UiDiaryDateWindow, UiDiaryTheme, UiDiaryThemeTimelinePage } from "@/types/diary/ui";

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ApiError) {
    return actionFailure(`[${error.status}] ${error.message}`);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("Unknown error");
}

export async function createThemeAction(themeName: unknown): Promise<ActionResult<UiDiaryTheme>> {
  const parsed = parseThemeName(themeName);
  if (!parsed.ok) {
    return actionFailure(parsed.error);
  }

  try {
    const theme = await diaryService.createDiaryTheme(parsed.data);
    return actionSuccess(theme);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateThemeNameAction(
  themeId: unknown,
  themeName: unknown,
): Promise<ActionResult<UiDiaryTheme>> {
  const parsedId = parseThemeId(themeId);
  if (!parsedId.ok) {
    return actionFailure(parsedId.error);
  }

  const parsedName = parseThemeName(themeName);
  if (!parsedName.ok) {
    return actionFailure(parsedName.error);
  }

  try {
    const theme = await diaryService.updateDiaryThemeName(parsedId.data, parsedName.data);
    return actionSuccess(theme);
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteThemeAction(themeId: unknown): Promise<ActionResult<void>> {
  const parsedId = parseThemeId(themeId);
  if (!parsedId.ok) {
    return actionFailure(parsedId.error);
  }

  try {
    await diaryService.deleteDiaryTheme(parsedId.data);
    return actionSuccess(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadDiaryThemeTimelinePageAction(
  themeId: unknown,
  cursor: unknown,
): Promise<ActionResult<UiDiaryThemeTimelinePage>> {
  const parsedId = parseThemeId(themeId);
  if (!parsedId.ok) {
    return actionFailure(parsedId.error);
  }

  if (typeof cursor !== "string" || !cursor.trim()) {
    return actionFailure("cursor가 올바르지 않습니다.");
  }

  try {
    const page = await diaryService.getDiaryThemeTimelinePage(parsedId.data, cursor.trim());
    return actionSuccess(page);
  } catch (error) {
    return toActionError(error);
  }
}

export async function fetchDiaryDateWindowAction(
  date: unknown,
  window = 1,
): Promise<ActionResult<UiDiaryDateWindow>> {
  const dateParam = typeof date === "string" ? date : "";
  const parsedDate = parseDiaryDateParam(dateParam);
  if (!parsedDate) {
    return actionFailure("날짜 형식이 올바르지 않습니다.");
  }

  try {
    const dateWindow = await diaryService.getDiaryDateWindow(parsedDate, window);
    return actionSuccess(dateWindow);
  } catch (error) {
    return toActionError(error);
  }
}
