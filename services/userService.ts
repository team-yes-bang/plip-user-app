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
    hasLocalAuth: data.hasLocalAuth === true,
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
    agreedAt: item.agreedAt,
    revokedAt: item.revokedAt,
  };
}

function mapTermsAgreementPatchItem(
  item: Awaited<ReturnType<typeof userApi.patchTermsAgreements>>["agreements"][number],
  source: UiTermsAgreementItem,
): UiTermsAgreementItem {
  return {
    ...source,
    agreed: item.agreed,
    agreedAt: item.agreedAt,
    revokedAt: item.revokedAt,
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

export async function patchTermsAgreement(termId: number, agreed: boolean): Promise<UiTermsAgreementItem> {
  const agreements = await getOptionalTermsAgreements();
  const source = agreements.find((item) => item.termId === termId);
  if (!source) {
    throw new Error("약관을 찾을 수 없습니다.");
  }

  const data = await userApi.patchTermsAgreements({
    agreements: [{ termId, agreed }],
  });
  const updated = data.agreements.find((item) => item.termId === termId);
  if (!updated) {
    throw new Error("약관 동의 결과를 찾을 수 없습니다.");
  }
  return mapTermsAgreementPatchItem(updated, source);
}

export async function withdrawAccount(): Promise<void> {
  await userApi.withdrawAccount();
}
