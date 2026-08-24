import * as authApi from "@/lib/api/authApi";
import type {
  ApiLocalLoginRequest,
  ApiLocalSignupRequest,
  ApiOtpPurpose,
  ApiPasswordResetRequest,
  ApiTermAgreement,
  ApiTokenReissueResponse,
  ApiTokenResponse,
} from "@/types/auth/api";
import type { UiAuthTokens, UiRestorePayload, UiTerm } from "@/types/auth/ui";

function mapTokenResponse(data: ApiTokenResponse): UiAuthTokens {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: Date.now() + data.accessTokenExpiresIn * 1000,
    userUuid: data.userUuid,
  };
}

function mapReissueResponse(data: ApiTokenReissueResponse): UiAuthTokens {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: Date.now() + data.accessTokenExpiresIn * 1000,
    userUuid: "",
  };
}

export async function loginLocal(payload: ApiLocalLoginRequest): Promise<UiAuthTokens> {
  const data = await authApi.postLoginLocal(payload);
  return mapTokenResponse(data);
}

export async function loginSocial(
  provider: string,
  accessToken: string,
  termsAgreements?: ApiTermAgreement[],
): Promise<UiAuthTokens> {
  const data = await authApi.postLoginSocial(provider, { accessToken, termsAgreements });
  return mapTokenResponse(data);
}

export async function reissueToken(refreshToken: string): Promise<UiAuthTokens> {
  const data = await authApi.postReissue({ refreshToken });
  const mapped = mapReissueResponse(data);
  return mapped;
}

export async function logout(refreshToken: string): Promise<void> {
  await authApi.postLogout({ refreshToken });
}

export async function requestEmailOtp(email: string, purpose: ApiOtpPurpose = "SIGNUP"): Promise<void> {
  await authApi.postEmailOtpRequest({ email, purpose });
}

export async function verifyEmailOtp(
  email: string,
  otpCode: string,
  purpose: ApiOtpPurpose = "SIGNUP",
): Promise<string> {
  const data = await authApi.postEmailOtpVerify({ email, otpCode, purpose });
  return data.verificationToken;
}

export async function listActiveTerms(): Promise<UiTerm[]> {
  const data = await authApi.getActiveTerms();
  return (data.terms ?? []).map((term) => ({
    id: term.id,
    title: term.title,
    required: term.required === true,
    termCode: term.termCode,
  }));
}

export async function signupLocal(payload: ApiLocalSignupRequest): Promise<UiAuthTokens> {
  const data = await authApi.postSignupLocal(payload);
  return mapTokenResponse(data);
}

export async function restoreAccount(payload: UiRestorePayload): Promise<UiAuthTokens> {
  if (payload.type === "local") {
    const data = await authApi.postRestoreLocal({
      email: payload.email,
      password: payload.password,
    });
    return mapTokenResponse(data);
  }

  if (payload.type === "social-pending") {
    throw new Error("social-pending restore must use restoreSocialPending()");
  }

  const data = await authApi.postRestoreSocial(payload.provider, {
    accessToken: payload.accessToken,
  });
  return mapTokenResponse(data);
}

export async function restoreSocialPending(pendingToken: string): Promise<UiAuthTokens> {
  const data = await authApi.postSocialRestorePending({ pendingToken });
  return mapTokenResponse(data);
}

export async function saveSocialSignupPending(
  provider: string,
  accessToken: string,
): Promise<string> {
  const data = await authApi.postSocialSignupPending({ provider, accessToken });
  return data.pendingToken;
}

export async function completeSocialSignup(
  pendingToken: string,
  termsAgreements: ApiTermAgreement[],
): Promise<UiAuthTokens> {
  const data = await authApi.postSocialSignupComplete({ pendingToken, termsAgreements });
  return mapTokenResponse(data);
}

export async function resetPassword(payload: ApiPasswordResetRequest): Promise<void> {
  await authApi.postPasswordReset(payload);
}
