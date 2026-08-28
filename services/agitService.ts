import * as agitApi from "@/lib/api/agitApi";
import { resolveAgitThumbnailUrl } from "@/lib/agit/thumbnailImage";
import { isEnableRemoteChatEnabled } from "@/lib/api/env";
import * as chatService from "@/services/chatService";
import type {
  ApiAgitDetail,
  ApiAgitLanding,
  ApiAgitPreview,
  ApiCreateAgitRequest,
  ApiCreateAgitResponse,
  ApiDiscoverSearchPage,
  ApiDiscoverSort,
  ApiJoinAgitResponse,
  ApiJoinRequestItem,
  ApiMyAgitItem,
  ApiUpdateAgitRequest,
  ApiUpdateMyMemberProfileRequest,
  ApiUpdateMyMemberProfileResponse,
} from "@/types/agit/api";
import * as analyticsApi from "@/lib/api/analyticsApi";
import type { UiAgit, UiCreateAgitInput } from "@/types/agit/ui";

export { sortAgitMembers } from "@/lib/agit/sortMembers";

const DEFAULT_COVER_GRADIENT = "linear-gradient(104deg, #2e1f52 0%, #7a5cfa 100%)";

function mapMyAgit(item: ApiMyAgitItem): UiAgit {
  return {
    id: item.agitUuid,
    name: item.agitName,
    memberCount: 0,
    description: "",
    coverGradient: DEFAULT_COVER_GRADIENT,
    topicCount: 0,
    joined: true,
  };
}

function mapAgitDetail(item: ApiAgitDetail): UiAgit {
  return {
    id: item.agitUuid,
    name: item.agitName,
    memberCount: item.currentMemberCount,
    description: item.description ?? "",
    coverGradient: DEFAULT_COVER_GRADIENT,
    topicCount: item.topics.length,
    maxMembers: item.maximumCapacity,
    ownerName: item.hostNickname,
    thumbnailSrc: resolveAgitThumbnailUrl(item.thumbnailPath),
    inviteCode: item.code,
    joined: true,
    myRole: item.myRole,
  };
}

export async function listMyAgits(): Promise<UiAgit[]> {
  const items = await agitApi.getMyAgits();
  const agits = items.map(mapMyAgit);

  if (!isEnableRemoteChatEnabled() || agits.length === 0) {
    return agits;
  }

  try {
    const unreadMap = await chatService.getMyAgitsChatUnread(agits.map((agit) => agit.id));
    return agits.map((agit) => {
      const chatUnreadCount = unreadMap.get(agit.id) ?? 0;
      return {
        ...agit,
        chatUnreadCount,
        hasNewChat: chatUnreadCount > 0,
      };
    });
  } catch {
    return agits;
  }
}

export async function getAgitAndMembers(agitId: string): Promise<{
  agit: UiAgit;
  members: ApiAgitDetail["members"];
}> {
  const item = await agitApi.getAgit(agitId);
  return {
    agit: mapAgitDetail(item),
    members: item.members ?? [],
  };
}

export async function getAgit(agitId: string): Promise<UiAgit> {
  const { agit } = await getAgitAndMembers(agitId);
  return agit;
}

function mapCreatedAgit(item: ApiCreateAgitResponse): UiAgit {
  return {
    id: item.agitUuid,
    name: item.agitName,
    memberCount: 1,
    description: item.description ?? "",
    coverGradient: DEFAULT_COVER_GRADIENT,
    topicCount: 0,
    maxMembers: item.maximumCapacity,
    ownerName: item.nickname,
    thumbnailSrc: resolveAgitThumbnailUrl(item.thumbnailPath),
    inviteCode: item.code,
    joined: true,
    myRole: item.role,
  };
}

export async function leaveAgit(agitId: string): Promise<void> {
  await agitApi.leaveAgit(agitId);
}

export async function banAgitMember(agitId: string, ampId: number): Promise<void> {
  await agitApi.banAgitMember(agitId, ampId);
}

export async function transferAgitHost(agitId: string, ampId: number): Promise<void> {
  await agitApi.transferAgitHost(agitId, ampId);
}

export async function reissueInviteCode(agitId: string): Promise<string> {
  const result = await agitApi.reissueInviteCode(agitId);
  return result.code;
}

export async function updateAgit(agitId: string, body: ApiUpdateAgitRequest): Promise<UiAgit> {
  await agitApi.updateAgit(agitId, body);
  return getAgit(agitId);
}

export async function updateMyMemberProfile(
  agitId: string,
  body: ApiUpdateMyMemberProfileRequest,
): Promise<ApiUpdateMyMemberProfileResponse> {
  return agitApi.updateMyMemberProfile(agitId, body);
}

function mapAgitLanding(item: ApiAgitLanding, inviteCode: string): UiAgit {
  return {
    id: inviteCode,
    name: item.agitName,
    memberCount: item.currentMemberCount,
    description: item.description ?? "",
    coverGradient: DEFAULT_COVER_GRADIENT,
    topicCount: 0,
    maxMembers: item.maximumCapacity,
    ownerName: item.hostNickname,
    thumbnailSrc: resolveAgitThumbnailUrl(item.thumbnailPath),
    inviteCode,
    joined: false,
  };
}

export async function getAgitLanding(code: string): Promise<UiAgit> {
  const landing = await agitApi.getAgitLanding(code);
  return mapAgitLanding(landing, code.trim().toUpperCase());
}

export async function joinAgitByCode(
  code: string,
  input: { nickname: string; profileImagePath?: string },
): Promise<ApiJoinAgitResponse> {
  return agitApi.joinAgit(code, {
    nickname: input.nickname,
    ...(input.profileImagePath ? { profileImagePath: input.profileImagePath } : {}),
  });
}

export async function searchDiscoverAgits(input: {
  q?: string;
  sort?: ApiDiscoverSort;
  size?: number;
}): Promise<UiAgit[]> {
  const page: ApiDiscoverSearchPage = await analyticsApi.searchDiscoverAgits({
    q: input.q,
    sort: input.sort,
    page: 0,
    size: input.size ?? 30,
  });
  return page.items.map((item) => ({
    id: item.agitUuid,
    name: item.agitName,
    memberCount: 0,
    description: item.description ?? "",
    coverGradient: DEFAULT_COVER_GRADIENT,
    topicCount: 0,
    thumbnailSrc: resolveAgitThumbnailUrl(item.thumbnailPath),
    joined: false,
  }));
}

export async function publishSearchMetric(type: string, agitUuid: string): Promise<void> {
  try {
    await analyticsApi.publishAnalyticsEvent(type, agitUuid);
  } catch {
    // 검색은 지표 발행 실패와 무관하게 동작
  }
}

export async function getAgitPreview(agitId: string): Promise<ApiAgitPreview> {
  return agitApi.getAgitPreview(agitId);
}

export async function issueAgitThumbnailUploadUrl(
  contentLengthBytes: number,
  contentType: string,
  agitUuid?: string,
): Promise<{ uploadKey: string; thumbnailPath: string; uploadUrl: string; expiresAt: string }> {
  return agitUuid
    ? agitApi.postAgitThumbnailUploadUrlForAgit(agitUuid, contentType, contentLengthBytes)
    : agitApi.postAgitThumbnailUploadUrl(contentType, contentLengthBytes);
}

export async function requestJoinAgit(
  agitId: string,
  input: { nickname: string; profileImagePath?: string },
): Promise<ApiJoinAgitResponse> {
  return agitApi.requestJoinAgit(agitId, {
    nickname: input.nickname,
    ...(input.profileImagePath ? { profileImagePath: input.profileImagePath } : {}),
  });
}

export async function listJoinRequests(agitId: string): Promise<ApiJoinRequestItem[]> {
  return agitApi.listJoinRequests(agitId);
}

export async function approveJoinRequest(agitId: string, ampId: number): Promise<void> {
  await agitApi.approveJoinRequest(agitId, ampId);
}

export async function rejectJoinRequest(agitId: string, ampId: number): Promise<void> {
  await agitApi.rejectJoinRequest(agitId, ampId);
}

export async function createAgit(input: UiCreateAgitInput): Promise<UiAgit> {
  const body: ApiCreateAgitRequest = {
    agitName: input.agitName,
    maximumCapacity: input.maximumCapacity,
    nickname: input.nickname,
    ...(input.description ? { description: input.description } : {}),
    ...(input.thumbnailPath ? { thumbnailPath: input.thumbnailPath } : {}),
    ...(input.profileImagePath ? { profileImagePath: input.profileImagePath } : {}),
  };
  const created = await agitApi.createAgit(body);
  return mapCreatedAgit(created);
}
