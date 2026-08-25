import { formatChatMessageTime } from "@/lib/chat/formatMessageTime";
import {
  buildChatMemberProfiles,
  resolveChatMemberProfile,
  type ChatMemberProfile,
} from "@/lib/chat/memberProfiles";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { ApiChatMessage } from "@/types/chat/api";
import type { UiChatMessage } from "@/types/chat/ui";

function mapMessage(
  message: ApiChatMessage,
  members: Map<string, ChatMemberProfile>,
  currentUserUuid?: string,
): UiChatMessage {
  const profile = resolveChatMemberProfile(message.senderUuid, members);
  const isMine = Boolean(
    currentUserUuid && message.senderUuid && message.senderUuid === currentUserUuid,
  );
  const senderName = message.type === "SYSTEM" ? "시스템" : isMine ? "나" : profile.nickname;

  return {
    id: message.id,
    agitUuid: message.agitUuid,
    senderUuid: message.senderUuid,
    type: message.type,
    content: message.content,
    payload: message.payload ?? undefined,
    createdAt: message.createdAt,
    senderName,
    isMine,
    timeLabel: formatChatMessageTime(message.createdAt),
    profileImageSrc: message.type === "TALK" && !isMine ? profile.profileImageSrc : undefined,
  };
}

export function mapApiChatMessage(
  message: ApiChatMessage,
  members: ApiAgitDetailMember[],
  currentUserUuid?: string,
): UiChatMessage {
  const profileMap = buildChatMemberProfiles(members);
  return mapMessage(message, profileMap, currentUserUuid);
}

export function mapApiChatMessages(
  messages: ApiChatMessage[],
  members: ApiAgitDetailMember[],
  currentUserUuid?: string,
): UiChatMessage[] {
  const profileMap = buildChatMemberProfiles(members);
  return messages.map((message) => mapMessage(message, profileMap, currentUserUuid));
}
