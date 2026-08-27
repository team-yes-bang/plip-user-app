"use server";

import { toUserActionError } from "@/lib/action/userActionError";
import * as notificationService from "@/services/notificationService";
import * as userService from "@/services/userService";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type { UiNotificationInbox, UiNotificationItem } from "@/types/notification/ui";

export async function getNotificationInboxAction(): Promise<ActionResult<UiNotificationInbox>> {
  try {
    return actionSuccess(await notificationService.ensureSeededInbox());
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function getUnreadNotificationCountAction(): Promise<ActionResult<number>> {
  try {
    return actionSuccess(await notificationService.getUnreadNotificationCount());
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function markNotificationReadAction(
  id: string,
): Promise<ActionResult<UiNotificationItem | void>> {
  try {
    return actionSuccess(await notificationService.markNotificationRead(id));
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<number>> {
  try {
    return actionSuccess(await notificationService.markAllNotificationsRead());
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function markInboxNotificationReadAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const profile = await userService.getMyProfile();
    await notificationService.markInboxRead(id, profile.userUuid);
    return actionSuccess(undefined);
  } catch (error) {
    if (error instanceof Error) {
      return actionFailure(error.message);
    }
    return actionFailure("알림을 읽음 처리하지 못했어요.");
  }
}
