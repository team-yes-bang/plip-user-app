import { formatChatMessageTime } from "@/lib/chat/formatMessageTime";
import type { UiChatMessage } from "@/types/chat/ui";

export function createLocalTalkMessage(
  agitUuid: string,
  content: string,
  currentUserUuid?: string,
): UiChatMessage {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    agitUuid,
    senderUuid: currentUserUuid ?? null,
    type: "TALK",
    content,
    createdAt: now,
    senderName: "나",
    isMine: true,
    timeLabel: formatChatMessageTime(now),
  };
}
