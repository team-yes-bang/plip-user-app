import * as agitApi from "@/lib/api/agitApi";
import { isEnableRemoteChatEnabled } from "@/lib/api/env";
import * as chatService from "@/services/chatService";
import type {
  ApiAgitDetail,
  ApiAgitLanding,
  ApiCreateAgitRequest,
  ApiCreateAgitResponse,
  ApiJoinAgitResponse,
  ApiMyAgitItem,
  ApiUpdateAgitRequest,
  ApiUpdateMyMemberProfileRequest,
  ApiUpdateMyMemberProfileResponse,
} from "@/types/agit/api";
import type { UiAgit, UiCreateAgitInput } from "@/types/agit/ui";

export { sortAgitMembers } from "@/lib/agit/sortMembers";

const DEFAULT_COVER_GRADIENT = "linear-gradient(104deg, #2e1f52 0%, #7a5cfa 100%)";

function toRenderableThumbnail(path: string | null | undefined): string | undefined {
  const trimmed = path?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

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
    thumbnailSrc: toRenderableThumbnail(item.thumbnailPath),
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
    thumbnailSrc: toRenderableThumbnail(item.thumbnailPath),
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
    thumbnailSrc: toRenderableThumbnail(item.thumbnailPath),
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
