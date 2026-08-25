import { formatChatMessageTime } from "@/lib/chat/formatMessageTime";
import { resolveChatMemberProfile } from "@/lib/chat/memberProfiles";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiChatHistory, UiChatMessage } from "@/types/chat/ui";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function buildIncomingMessage(
  agitUuid: string,
  member: ApiAgitDetailMember,
  content: string,
  createdAt: string,
): UiChatMessage {
  const profile = resolveChatMemberProfile(member.userUuid, new Map([[member.userUuid, {
    nickname: member.nickname.trim() || "멤버",
    profileImageSrc: member.profileImagePath?.trim() || "/plip/v13/profile-avatar.svg",
  }]]));

  return {
    id: `seed-${member.userUuid}-${createdAt}`,
    agitUuid,
    senderUuid: member.userUuid,
    type: "TALK",
    content,
    createdAt,
    senderName: profile.nickname,
    isMine: false,
    timeLabel: formatChatMessageTime(createdAt),
    profileImageSrc: profile.profileImageSrc,
  };
}

export function buildSeedChatHistory(
  agitUuid: string,
  members: ApiAgitDetailMember[],
  currentUserUuid?: string,
): UiChatHistory {
  const others = members.filter((member) => member.userUuid !== currentUserUuid);
  const first = others[0];
  const second = others[1];

  const messages: UiChatMessage[] = [];

  if (first) {
    messages.push(
      buildIncomingMessage(
        agitUuid,
        first,
        "오늘 토픽은 어떤 주제로 진행할까요?",
        minutesAgo(18),
      ),
    );
  }

  if (second) {
    messages.push(
      buildIncomingMessage(
        agitUuid,
        second,
        "저는 러닝 인증 쪽이 좋을 것 같아요.",
        minutesAgo(16),
      ),
    );
  } else if (first) {
    messages.push(
      buildIncomingMessage(
        agitUuid,
        first,
        "메시지를 보내 대화를 이어가 보세요.",
        minutesAgo(14),
      ),
    );
  }

  return {
    messages,
    nextCursor: null,
    hasNext: false,
  };
}
