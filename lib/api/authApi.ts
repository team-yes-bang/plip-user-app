import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import type {
  ApiAccountRestoreResponse,
  ApiEmailOtpRequest,
  ApiEmailOtpRequestResponse,
  ApiEmailOtpVerifyRequest,
  ApiEmailOtpVerifyResponse,
  ApiLocalLoginRequest,
  ApiLocalLoginResponse,
  ApiLocalSignupRequest,
  ApiLocalSignupResponse,
  ApiLogoutRequest,
  ApiLogoutResponse,
  ApiPasswordResetRequest,
  ApiPasswordResetResponse,
  ApiSocialLoginRequest,
  ApiSocialLoginResponse,
  ApiSocialSignupCompleteRequest,
  ApiSocialSignupPendingRequest,
  ApiSocialSignupPendingResponse,
  ApiSocialRestorePendingRequest,
  ApiTermsListResponse,
  ApiTokenReissueRequest,
  ApiTokenReissueResponse,
} from "@/types/auth/api";

export async function postLoginLocal(body: ApiLocalLoginRequest): Promise<ApiLocalLoginResponse> {
  return apiFetch<ApiLocalLoginResponse>(API_ENDPOINTS.auth.loginLocal, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postLoginSocial(
  provider: string,
  body: ApiSocialLoginRequest,
): Promise<ApiSocialLoginResponse> {
  return apiFetch<ApiSocialLoginResponse>(API_ENDPOINTS.auth.loginSocial(provider), {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postReissue(body: ApiTokenReissueRequest): Promise<ApiTokenReissueResponse> {
  return apiFetch<ApiTokenReissueResponse>(API_ENDPOINTS.auth.reissue, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postLogout(body: ApiLogoutRequest): Promise<ApiLogoutResponse> {
  return apiFetch<ApiLogoutResponse>(API_ENDPOINTS.auth.logout, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
  });
}

export async function postEmailOtpRequest(
  body: ApiEmailOtpRequest,
): Promise<ApiEmailOtpRequestResponse> {
  return apiFetch<ApiEmailOtpRequestResponse>(API_ENDPOINTS.auth.otpRequest, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postEmailOtpVerify(
  body: ApiEmailOtpVerifyRequest,
): Promise<ApiEmailOtpVerifyResponse> {
  return apiFetch<ApiEmailOtpVerifyResponse>(API_ENDPOINTS.auth.otpVerify, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function getActiveTerms(): Promise<ApiTermsListResponse> {
  return apiFetch<ApiTermsListResponse>(API_ENDPOINTS.auth.terms, {
    method: "GET",
    baseUrl: getApiUrl(),
    auth: false,
  });
}

export async function postSignupLocal(body: ApiLocalSignupRequest): Promise<ApiLocalSignupResponse> {
  return apiFetch<ApiLocalSignupResponse>(API_ENDPOINTS.auth.signupLocal, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postRestoreLocal(
  body: ApiLocalLoginRequest,
): Promise<ApiAccountRestoreResponse> {
  return apiFetch<ApiAccountRestoreResponse>(API_ENDPOINTS.auth.restoreLocal, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postRestoreSocial(
  provider: string,
  body: ApiSocialLoginRequest,
): Promise<ApiAccountRestoreResponse> {
  return apiFetch<ApiAccountRestoreResponse>(API_ENDPOINTS.auth.restoreSocial(provider), {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postSocialSignupPending(
  body: ApiSocialSignupPendingRequest,
): Promise<ApiSocialSignupPendingResponse> {
  return apiFetch<ApiSocialSignupPendingResponse>(API_ENDPOINTS.auth.socialSignupPending, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postSocialSignupComplete(
  body: ApiSocialSignupCompleteRequest,
): Promise<ApiSocialLoginResponse> {
  return apiFetch<ApiSocialLoginResponse>(API_ENDPOINTS.auth.socialSignupComplete, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postSocialRestorePending(
  body: ApiSocialRestorePendingRequest,
): Promise<ApiAccountRestoreResponse> {
  return apiFetch<ApiAccountRestoreResponse>(API_ENDPOINTS.auth.socialRestorePending, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}

export async function postPasswordReset(
  body: ApiPasswordResetRequest,
): Promise<ApiPasswordResetResponse> {
  return apiFetch<ApiPasswordResetResponse>(API_ENDPOINTS.auth.passwordReset, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
  });
}
