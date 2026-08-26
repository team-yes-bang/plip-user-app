import * as chatApi from "@/lib/api/chatApi";
import { mapApiChatMessages } from "@/lib/chat/mapMessage";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiChatHistory } from "@/types/chat/ui";

type GetHistoryOptions = {
  members: ApiAgitDetailMember[];
  currentUserUuid?: string;
  cursorCreatedAt?: string;
  cursorId?: string;
  size?: number;
};

export async function getChatHistory(
  agitUuid: string,
  options: GetHistoryOptions,
): Promise<UiChatHistory> {
  const history = await chatApi.getChatHistory(agitUuid, {
    cursorCreatedAt: options.cursorCreatedAt,
    cursorId: options.cursorId,
    size: options.size ?? 20,
  });

  const messages = mapApiChatMessages(
    history.messages,
    options.members,
    options.currentUserUuid,
  ).reverse();

  return {
    messages,
    nextCursor: history.nextCursor,
    hasNext: history.hasNext,
  };
}

export async function markChatRead(agitUuid: string, readAt?: string): Promise<void> {
  await chatApi.markChatRead(agitUuid, readAt);
}

export async function getMyAgitsChatUnread(
  agitUuids: string[],
): Promise<Map<string, number>> {
  if (agitUuids.length === 0) {
    return new Map();
  }
  const response = await chatApi.getMyAgitsChatUnread(agitUuids);
  return new Map(response.items.map((item) => [item.agitUuid, item.unreadMessageCount]));
}

export async function issueWsTicket(): Promise<{ ticket: string; expiresInSeconds: number }> {
  return chatApi.issueWsTicket();
}
