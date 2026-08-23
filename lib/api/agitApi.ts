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
