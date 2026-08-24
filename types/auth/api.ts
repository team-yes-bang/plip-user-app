export type ApiErrorBody = {
  code?: string;
  message?: string;
};

export type ApiLocalLoginRequest = {
  email: string;
  password: string;
};

export type ApiTokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  userUuid: string;
};

export type ApiLocalLoginResponse = ApiTokenResponse;

export type ApiSocialLoginRequest = {
  accessToken: string;
  termsAgreements?: ApiTermAgreement[];
};

export type ApiTermAgreement = {
  termId: number;
  agreed: boolean;
};

export type ApiSocialLoginResponse = ApiTokenResponse & {
  newUser?: boolean;
};

export type ApiTokenReissueRequest = {
  refreshToken: string;
};

export type ApiTokenReissueResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
};

export type ApiLogoutRequest = {
  refreshToken: string;
};

export type ApiLogoutResponse = {
  code?: string;
  message?: string;
};

export type ApiAccountRestoreRequest = {
  email?: string;
  password?: string;
  accessToken?: string;
};

export type ApiAccountRestoreResponse = ApiTokenResponse & {
  code?: string;
  message?: string;
};

export type ApiOtpPurpose = "SIGNUP" | "PASSWORD_RESET";

export type ApiEmailOtpRequest = {
  email: string;
  purpose?: ApiOtpPurpose;
};

export type ApiEmailOtpRequestResponse = {
  message?: string;
};

export type ApiEmailOtpVerifyRequest = {
  email: string;
  otpCode: string;
  purpose?: ApiOtpPurpose;
};

export type ApiEmailOtpVerifyResponse = {
  verificationToken: string;
};

export type ApiLocalSignupRequest = {
  email: string;
  verificationToken: string;
  password: string;
  nickname: string;
  termsAgreements?: ApiTermAgreement[];
};

export type ApiLocalSignupResponse = ApiTokenResponse & {
  message?: string;
};

export type ApiTermResponse = {
  id: number;
  title: string;
  contentPath?: string;
  termCode?: string;
  version?: string;
  required?: boolean;
};

export type ApiTermsListResponse = {
  terms: ApiTermResponse[];
};

export type ApiPasswordResetRequest = {
  email: string;
  verificationToken: string;
  newPassword: string;
};

export type ApiPasswordResetResponse = {
  message?: string;
};

export type ApiSocialSignupPendingRequest = {
  provider: string;
  accessToken: string;
};

export type ApiSocialSignupPendingResponse = {
  pendingToken: string;
  expiresInSeconds: number;
};

export type ApiSocialSignupCompleteRequest = {
  pendingToken: string;
  termsAgreements?: ApiTermAgreement[];
};

export type ApiSocialRestorePendingRequest = {
  pendingToken: string;
};
