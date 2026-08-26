"use server";

/**
 * 촬영(/video) 업로드 설정용 destination 조회·생성.
 * topic/diary/agit action·template은 수정하지 않고, video 캡처 도메인에서만 orchestration.
 */
import { listMyAgitsAction } from "@/actions/agitActions";
import { createThemeAction, listDiaryThemesAction } from "@/actions/diaryActions";
import { createTopicAction, listAgitTopicsAction } from "@/actions/topicActions";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type { UiAgit } from "@/types/agit/ui";
import type { UiDiaryTheme } from "@/types/diary/ui";
import type { UiTopicListItem } from "@/types/topic/ui";

export async function listCaptureAgitsAction(): Promise<ActionResult<UiAgit[]>> {
  return listMyAgitsAction();
}

export async function listCaptureThemesAction(): Promise<ActionResult<UiDiaryTheme[]>> {
  return listDiaryThemesAction();
}

export async function listCaptureTopicsAction(
  agitUuid: string,
): Promise<ActionResult<UiTopicListItem[]>> {
  return listAgitTopicsAction(agitUuid);
}

export async function createCaptureThemeAction(
  themeName: string,
): Promise<ActionResult<UiDiaryTheme>> {
  const created = await createThemeAction(themeName);
  if (!created.ok) {
    return created;
  }

  const themes = await listDiaryThemesAction();
  if (!themes.ok) {
    return actionFailure(themes.error);
  }

  const theme = themes.data.find((item) => item.id === created.data.id) ?? created.data;
  return actionSuccess(theme);
}

export async function createCaptureTopicAction(
  agitUuid: string,
  title: string,
  startDate: string,
): Promise<ActionResult<UiTopicListItem>> {
  return createTopicAction(agitUuid, { title, startDate });
}
