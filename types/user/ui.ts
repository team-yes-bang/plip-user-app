export type UiUserProfile = {
  userUuid: string;
  nickname: string;
  profileImageUrl: string;
  email: string;
};

export type UiNotificationSettings = {
  agitNotifyEnabled: boolean;
  diaryNotifyEnabled: boolean;
  diaryNotifyTime: string;
};

export type UiTermsAgreementItem = {
  termId: number;
  termCode: string;
  title: string;
  contentPath: string;
  required: boolean;
  agreed: boolean;
};

export const USER_NICKNAME_MIN_LENGTH = 2;
export const USER_NICKNAME_MAX_LENGTH = 12;

export const DEFAULT_PROFILE_AVATAR = "/plip/v13/profile-avatar.svg";
