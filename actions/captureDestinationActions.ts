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
  const before = await listAgitTopicsAction(agitUuid);
  if (!before.ok) {
    return before;
  }
  const beforeIds = new Set(before.data.map((item) => item.id));

  const created = await createTopicAction(agitUuid, { title, startDate });
  if (!created.ok) {
    return created;
  }

  const after = await listAgitTopicsAction(agitUuid);
  if (!after.ok) {
    return actionFailure(after.error);
  }

  const newTopic = after.data.find((item) => !beforeIds.has(item.id));
  if (!newTopic) {
    return actionFailure("새 토픽을 목록에서 찾지 못했습니다.");
  }

  return actionSuccess(newTopic);
}
