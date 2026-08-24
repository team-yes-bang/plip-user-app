export type ApiUserProfileResponse = {
  userUuid: string;
  nickname: string;
  profileImagePath: string | null;
  email: string;
  hasLocalAuth: boolean;
};

export type ApiProfileUpdateRequest = {
  nickname?: string;
  profileImagePath?: string;
};

export type ApiPasswordChangeRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ApiPasswordChangeResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  message: string;
};

export type ApiNotificationSettingsResponse = {
  agitNotifyEnabled: boolean;
  diaryNotifyEnabled: boolean;
  diaryNotifyTime: string;
};

export type ApiNotificationSettingsPatchRequest = {
  agitNotifyEnabled?: boolean;
  diaryNotifyEnabled?: boolean;
  diaryNotifyTime?: string;
};

export type ApiUserTermsAgreementItem = {
  termId: number;
  termCode: string;
  title: string;
  contentPath: string;
  required: boolean;
  agreed: boolean;
  agreedAt: string | null;
  revokedAt: string | null;
};

export type ApiUserTermsAgreementsListResponse = {
  agreements: ApiUserTermsAgreementItem[];
};

export type ApiTermsAgreementsUpdateRequest = {
  agreements: Array<{ termId: number; agreed: boolean }>;
};

export type ApiTermsAgreementsUpdateResponse = {
  agreements: Array<{
    termId: number;
    agreed: boolean;
    agreedAt: string | null;
    revokedAt: string | null;
  }>;
};

export type ApiUserWithdrawResponse = {
  message: string;
};
