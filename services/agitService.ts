import * as agitApi from "@/lib/api/agitApi";
import type {
  ApiAgitDetail,
  ApiAgitDetailMember,
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
    thumbnailSrc: item.thumbnailPath ?? undefined,
    inviteCode: item.code,
    joined: true,
    myRole: item.myRole,
  };
}

export function sortAgitMembers(
  members: ApiAgitDetailMember[],
  currentUserUuid?: string,
): ApiAgitDetailMember[] {
  return [...members].sort((a, b) => {
    const rank = (member: ApiAgitDetailMember) => {
      if (member.role === "HOST") return 0;
      if (currentUserUuid && member.userUuid === currentUserUuid) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });
}

export async function listMyAgits(): Promise<UiAgit[]> {
  const items = await agitApi.getMyAgits();
  return items.map(mapMyAgit);
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
    thumbnailSrc: item.thumbnailPath ?? undefined,
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
    thumbnailSrc: item.thumbnailPath ?? undefined,
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
