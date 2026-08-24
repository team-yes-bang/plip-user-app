export type SocialProvider = "google" | "kakao" | "naver";

export type UiAuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  userUuid: string;
};

export type UiLoginCredentials = {
  email: string;
  password: string;
};

export type UiRestoreLocalPayload = {
  type: "local";
  email: string;
  password: string;
};

export type UiRestoreSocialPayload = {
  type: "social";
  provider: SocialProvider;
  accessToken: string;
};

export type UiRestoreSocialPendingPayload = {
  type: "social-pending";
  provider: SocialProvider;
};

export type UiRestorePayload =
  | UiRestoreLocalPayload
  | UiRestoreSocialPayload
  | UiRestoreSocialPendingPayload;

export type UiOtpPurpose = "SIGNUP" | "PASSWORD_RESET";

export type UiTerm = {
  id: number;
  title: string;
  required: boolean;
  termCode?: string;
};

export type UiSignupDraft = {
  email: string;
  password: string;
  verificationToken: string;
  termsAgreements: { termId: number; agreed: boolean }[];
};

export type UiPasswordResetDraft = {
  email: string;
  verificationToken: string;
};
