import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import type {
  ApiAccountRestoreRequest,
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
  ApiSocialLoginRequest,
  ApiSocialLoginResponse,
  ApiTermsListResponse,
  ApiTokenReissueRequest,
  ApiTokenReissueResponse,
} from "@/types/auth/api";

type AuthFetchOptions = {
  bearerToken?: string;
};

function buildAuthHeaders(bearerToken?: string): Record<string, string> | undefined {
  if (!bearerToken) {
    return undefined;
  }
  return { Authorization: `Bearer ${bearerToken}` };
}

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

export async function postRestoreAccount(
  body: ApiAccountRestoreRequest,
  options: AuthFetchOptions = {},
): Promise<ApiAccountRestoreResponse> {
  return apiFetch<ApiAccountRestoreResponse>(API_ENDPOINTS.users.restore, {
    method: "POST",
    baseUrl: getApiUrl(),
    body,
    auth: false,
    headers: buildAuthHeaders(options.bearerToken),
  });
}
