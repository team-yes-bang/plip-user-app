import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type {
  ApiNotificationSettingsPatchRequest,
  ApiNotificationSettingsResponse,
  ApiPasswordChangeRequest,
  ApiPasswordChangeResponse,
  ApiProfileUpdateRequest,
  ApiTermsAgreementsUpdateRequest,
  ApiTermsAgreementsUpdateResponse,
  ApiUserProfileResponse,
  ApiUserTermsAgreementsListResponse,
  ApiUserWithdrawResponse,
} from "@/types/user/api";

export async function getMyProfileWithAccessToken(
  accessToken: string,
): Promise<ApiUserProfileResponse> {
  return apiFetch<ApiUserProfileResponse>(API_ENDPOINTS.users.me, {
    method: "GET",
    baseUrl: getApiUrl(),
    auth: false,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getMyProfile(): Promise<ApiUserProfileResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiUserProfileResponse>(API_ENDPOINTS.users.me, {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function patchMyProfile(body: ApiProfileUpdateRequest): Promise<ApiUserProfileResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiUserProfileResponse>(API_ENDPOINTS.users.profile, {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function patchMyPassword(body: ApiPasswordChangeRequest): Promise<ApiPasswordChangeResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiPasswordChangeResponse>(API_ENDPOINTS.users.password, {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function getNotificationSettings(): Promise<ApiNotificationSettingsResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationSettingsResponse>(API_ENDPOINTS.users.notificationSettings, {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function patchNotificationSettings(
  body: ApiNotificationSettingsPatchRequest,
): Promise<ApiNotificationSettingsResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiNotificationSettingsResponse>(API_ENDPOINTS.users.notificationSettings, {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function getTermsAgreements(): Promise<ApiUserTermsAgreementsListResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiUserTermsAgreementsListResponse>(API_ENDPOINTS.users.termsAgreements, {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function patchTermsAgreements(
  body: ApiTermsAgreementsUpdateRequest,
): Promise<ApiTermsAgreementsUpdateResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiTermsAgreementsUpdateResponse>(API_ENDPOINTS.users.termsAgreements, {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function withdrawAccount(): Promise<ApiUserWithdrawResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiUserWithdrawResponse>(API_ENDPOINTS.users.me, {
      method: "DELETE",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}
