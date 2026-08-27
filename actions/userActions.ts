"use server";

import { signOut } from "@/auth";
import * as authService from "@/services/authService";
import * as userService from "@/services/userService";
import { toUserActionError } from "@/lib/action/userActionError";
import { ApiError } from "@/lib/api/apiFetch";
import { saveProfileImageFile } from "@/lib/user/saveProfileImage";
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result";
import type { UiAuthTokens } from "@/types/auth/ui";
import type { UiNotificationSettings, UiTermsAgreementItem, UiUserProfile } from "@/types/user/ui";
import {
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH,
} from "@/types/user/ui";

function parseNickname(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < USER_NICKNAME_MIN_LENGTH || trimmed.length > USER_NICKNAME_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}

export async function getMyProfileAction(): Promise<ActionResult<UiUserProfile>> {
  try {
    const profile = await userService.getMyProfile();
    return actionSuccess(profile);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function updateMyProfileAction(
  formData: FormData,
): Promise<ActionResult<UiUserProfile>> {
  const nicknameValue = formData.get("nickname");
  const imageValue = formData.get("profileImage");
  const imageFile = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

  const parsed = parseNickname(nicknameValue);
  if (nicknameValue != null && String(nicknameValue).trim() !== "" && !parsed) {
    return actionFailure(`닉네임은 ${USER_NICKNAME_MIN_LENGTH}~${USER_NICKNAME_MAX_LENGTH}자여야 합니다.`);
  }
  if (!parsed && !imageFile) {
    return actionFailure(`닉네임은 ${USER_NICKNAME_MIN_LENGTH}~${USER_NICKNAME_MAX_LENGTH}자여야 합니다.`);
  }

  try {
    const current = await userService.getMyProfile();
    const nicknameChanged = Boolean(parsed && parsed !== current.nickname);
    const profileImagePath = imageFile
      ? await saveProfileImageFile(current.userUuid, imageFile)
      : undefined;

    if (!nicknameChanged && !profileImagePath) {
      return actionFailure("변경 사항이 없습니다.");
    }

    const profile = await userService.updateMyProfile({
      ...(nicknameChanged && parsed ? { nickname: parsed } : {}),
      ...(profileImagePath ? { profileImagePath } : {}),
    });
    return actionSuccess(profile);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function changePasswordAction(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult<UiAuthTokens>> {
  if (!payload.currentPassword || !payload.newPassword) {
    return actionFailure("비밀번호를 입력해 주세요.");
  }
  if (payload.newPassword.length < 8) {
    return actionFailure("새 비밀번호는 8자 이상이어야 합니다.");
  }

  try {
    const tokens = await userService.changePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
    return actionSuccess(tokens);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function getNotificationSettingsAction(): Promise<ActionResult<UiNotificationSettings>> {
  try {
    const settings = await userService.getNotificationSettings();
    return actionSuccess(settings);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function patchNotificationSettingsAction(
  payload: Partial<UiNotificationSettings>,
): Promise<ActionResult<UiNotificationSettings>> {
  try {
    const settings = await userService.patchNotificationSettings(payload);
    return actionSuccess(settings);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function getOptionalTermsAgreementsAction(): Promise<ActionResult<UiTermsAgreementItem[]>> {
  try {
    const agreements = await userService.getOptionalTermsAgreements();
    return actionSuccess(agreements);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function patchTermsAgreementAction(
  termId: number,
  agreed: boolean,
): Promise<ActionResult<UiTermsAgreementItem>> {
  try {
    const updated = await userService.patchTermsAgreement(termId, agreed);
    return actionSuccess(updated);
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function withdrawAccountAction(payload: {
  email?: string;
  password?: string;
}): Promise<ActionResult<void>> {
  try {
    if (payload.email && payload.password) {
      await authService.loginLocal({
        email: payload.email,
        password: payload.password,
      });
    }
    await userService.withdrawAccount();
    await signOut({ redirect: false });
    return actionSuccess(undefined);
  } catch (error) {
    if (error instanceof ApiError && payload.password) {
      return actionFailure("비밀번호가 올바르지 않습니다.");
    }
    return toUserActionError(error);
  }
}
