import * as userApi from "@/lib/api/userApi";
import { normalizeDiaryNotifyTime } from "@/lib/user/diaryNotifyTime";
import { resolveProfileImageUrl } from "@/lib/user/profileImage";
import type {
  ApiNotificationSettingsPatchRequest,
  ApiPasswordChangeRequest,
  ApiProfileUpdateRequest,
} from "@/types/user/api";
import type {
  UiNotificationSettings,
  UiTermsAgreementItem,
  UiUserProfile,
} from "@/types/user/ui";
import type { UiAuthTokens } from "@/types/auth/ui";

function mapProfile(data: Awaited<ReturnType<typeof userApi.getMyProfile>>): UiUserProfile {
  return {
    userUuid: data.userUuid,
    nickname: data.nickname,
    profileImageUrl: resolveProfileImageUrl(data.profileImagePath),
    email: data.email,
  };
}

function mapNotificationSettings(
  data: Awaited<ReturnType<typeof userApi.getNotificationSettings>>,
): UiNotificationSettings {
  return {
    agitNotifyEnabled: data.agitNotifyEnabled,
    diaryNotifyEnabled: data.diaryNotifyEnabled,
    diaryNotifyTime: normalizeDiaryNotifyTime(data.diaryNotifyTime),
  };
}

function mapTermsAgreement(item: Awaited<ReturnType<typeof userApi.getTermsAgreements>>["agreements"][number]): UiTermsAgreementItem {
  return {
    termId: item.termId,
    termCode: item.termCode,
    title: item.title,
    contentPath: item.contentPath,
    required: item.required,
    agreed: item.agreed,
  };
}

export function toApiDiaryNotifyTime(value: string): string {
  const normalized = normalizeDiaryNotifyTime(value);
  return `${normalized}:00`;
}

export async function getMyProfile(): Promise<UiUserProfile> {
  const data = await userApi.getMyProfile();
  return mapProfile(data);
}

export async function updateMyProfile(payload: ApiProfileUpdateRequest): Promise<UiUserProfile> {
  const data = await userApi.patchMyProfile(payload);
  return mapProfile(data);
}

export async function changePassword(payload: ApiPasswordChangeRequest): Promise<UiAuthTokens> {
  const data = await userApi.patchMyPassword(payload);
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: Date.now() + data.accessTokenExpiresIn * 1000,
    userUuid: "",
  };
}

export async function getNotificationSettings(): Promise<UiNotificationSettings> {
  const data = await userApi.getNotificationSettings();
  return mapNotificationSettings(data);
}

export async function patchNotificationSettings(
  payload: ApiNotificationSettingsPatchRequest,
): Promise<UiNotificationSettings> {
  const body: ApiNotificationSettingsPatchRequest = { ...payload };
  if (body.diaryNotifyTime) {
    body.diaryNotifyTime = toApiDiaryNotifyTime(body.diaryNotifyTime);
  }
  const data = await userApi.patchNotificationSettings(body);
  return mapNotificationSettings(data);
}

export async function getOptionalTermsAgreements(): Promise<UiTermsAgreementItem[]> {
  const data = await userApi.getTermsAgreements();
  return data.agreements.filter((item) => !item.required).map(mapTermsAgreement);
}

export async function patchTermsAgreement(termId: number, agreed: boolean): Promise<void> {
  await userApi.patchTermsAgreements({
    agreements: [{ termId, agreed }],
  });
}

export async function withdrawAccount(): Promise<void> {
  await userApi.withdrawAccount();
}
