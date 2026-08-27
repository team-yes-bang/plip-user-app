import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getActorUserHeaders } from "@/lib/api/actorHeaders";
import { apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl } from "@/lib/api/env";
import { withAuthRetry } from "@/lib/api/withAuthRetry";
import type {
  ApiAgitDetail,
  ApiCreateAgitRequest,
  ApiCreateAgitResponse,
  ApiMyAgitItem,
  ApiUpdateAgitRequest,
  ApiUpdateAgitResponse,
  ApiReissueInviteCodeResponse,
  ApiAgitLanding,
  ApiAgitPreview,
  ApiJoinAgitRequest,
  ApiJoinAgitResponse,
  ApiJoinRequestItem,
  ApiUpdateMyMemberProfileRequest,
  ApiUpdateMyMemberProfileResponse,
} from "@/types/agit/api";

export async function getMyAgits(): Promise<ApiMyAgitItem[]> {
  return withAuthRetry(async () =>
    apiFetch<ApiMyAgitItem[]>(API_ENDPOINTS.agit.me, {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function getAgit(agitUuid: string): Promise<ApiAgitDetail> {
  return withAuthRetry(async () =>
    apiFetch<ApiAgitDetail>(API_ENDPOINTS.agit.detail(agitUuid), {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function createAgit(body: ApiCreateAgitRequest): Promise<ApiCreateAgitResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiCreateAgitResponse>(API_ENDPOINTS.agit.create, {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function leaveAgit(agitUuid: string): Promise<void> {
  await withAuthRetry(async () =>
    apiFetch<void>(API_ENDPOINTS.agit.leave(agitUuid), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function banAgitMember(agitUuid: string, ampId: number): Promise<void> {
  await withAuthRetry(async () =>
    apiFetch<void>(API_ENDPOINTS.agit.ban(agitUuid, ampId), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function transferAgitHost(agitUuid: string, ampId: number): Promise<void> {
  await withAuthRetry(async () =>
    apiFetch<void>(API_ENDPOINTS.agit.transferHost(agitUuid, ampId), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function reissueInviteCode(agitUuid: string): Promise<ApiReissueInviteCodeResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiReissueInviteCodeResponse>(API_ENDPOINTS.agit.inviteCode(agitUuid), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function updateAgit(
  agitUuid: string,
  body: ApiUpdateAgitRequest,
): Promise<ApiUpdateAgitResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiUpdateAgitResponse>(API_ENDPOINTS.agit.detail(agitUuid), {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function getAgitLanding(code: string): Promise<ApiAgitLanding> {
  return apiFetch<ApiAgitLanding>(API_ENDPOINTS.agit.landing(code), {
    method: "GET",
    baseUrl: getApiUrl(),
    headers: await getActorUserHeaders(),
  });
}

export async function getAgitPreview(agitUuid: string): Promise<ApiAgitPreview> {
  return withAuthRetry(async () =>
    apiFetch<ApiAgitPreview>(API_ENDPOINTS.agit.preview(agitUuid), {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function requestJoinAgit(
  agitUuid: string,
  body: ApiJoinAgitRequest,
): Promise<ApiJoinAgitResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiJoinAgitResponse>(API_ENDPOINTS.agit.joinRequests(agitUuid), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function listJoinRequests(agitUuid: string): Promise<ApiJoinRequestItem[]> {
  return withAuthRetry(async () =>
    apiFetch<ApiJoinRequestItem[]>(API_ENDPOINTS.agit.joinRequests(agitUuid), {
      method: "GET",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function approveJoinRequest(agitUuid: string, ampId: number): Promise<ApiJoinAgitResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiJoinAgitResponse>(API_ENDPOINTS.agit.approveJoinRequest(agitUuid, ampId), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function rejectJoinRequest(agitUuid: string, ampId: number): Promise<void> {
  await withAuthRetry(async () =>
    apiFetch<void>(API_ENDPOINTS.agit.rejectJoinRequest(agitUuid, ampId), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
    }),
  );
}

export async function joinAgit(code: string, body: ApiJoinAgitRequest): Promise<ApiJoinAgitResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiJoinAgitResponse>(API_ENDPOINTS.agit.join(code), {
      method: "POST",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}

export async function updateMyMemberProfile(
  agitUuid: string,
  body: ApiUpdateMyMemberProfileRequest,
): Promise<ApiUpdateMyMemberProfileResponse> {
  return withAuthRetry(async () =>
    apiFetch<ApiUpdateMyMemberProfileResponse>(API_ENDPOINTS.agit.memberMe(agitUuid), {
      method: "PATCH",
      baseUrl: getApiUrl(),
      headers: await getActorUserHeaders(),
      body,
    }),
  );
}
