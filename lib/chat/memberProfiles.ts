import type { ApiAgitDetailMember } from "@/types/agit/api";

const FALLBACK_AVATAR = "/plip/v13/profile-avatar.svg";
const FALLBACK_NICKNAME = "멤버";

export type ChatMemberProfile = {
  nickname: string;
  profileImageSrc: string;
};

export function buildChatMemberProfiles(
  members: ApiAgitDetailMember[],
): Map<string, ChatMemberProfile> {
  const map = new Map<string, ChatMemberProfile>();
  for (const member of members) {
    map.set(member.userUuid, {
      nickname: member.nickname.trim() || FALLBACK_NICKNAME,
      profileImageSrc: member.profileImagePath?.trim() || FALLBACK_AVATAR,
    });
  }
  return map;
}

export function resolveChatMemberProfile(
  userUuid: string | null | undefined,
  members: Map<string, ChatMemberProfile>,
): ChatMemberProfile {
  if (!userUuid) {
    return {
      nickname: "시스템",
      profileImageSrc: FALLBACK_AVATAR,
    };
  }
  return (
    members.get(userUuid) ?? {
      nickname: FALLBACK_NICKNAME,
      profileImageSrc: FALLBACK_AVATAR,
    }
  );
}
