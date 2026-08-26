import type { UiChatHistory, UiChatMessage } from "@/types/chat/ui";

const ROOM_PREFIX = "plip-chat-room:";

type RoomHistoryCache = UiChatHistory;

type ParsedRoomCacheEntry = {
  raw: string;
  history: RoomHistoryCache;
};

function stripUnreadMemberCount(message: UiChatMessage): UiChatMessage {
  const { unreadMemberCount, ...rest } = message;
  void unreadMemberCount;
  return rest;
}

const parsedRoomCache = new Map<string, ParsedRoomCacheEntry>();

function storageKey(agitId: string): string {
  return `${ROOM_PREFIX}${agitId}`;
}

export function writeRoomHistoryCache(agitId: string, history: RoomHistoryCache): void {
  if (typeof window === "undefined") {
    return;
  }
  const sanitized: RoomHistoryCache = {
    ...history,
    messages: history.messages.map(stripUnreadMemberCount),
  };
  const raw = JSON.stringify(sanitized);
  sessionStorage.setItem(storageKey(agitId), raw);
  parsedRoomCache.set(agitId, { raw, history: sanitized });
}

export function readRoomHistoryCache(agitId: string): RoomHistoryCache | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(storageKey(agitId));
  if (!raw) {
    parsedRoomCache.delete(agitId);
    return null;
  }
  const cached = parsedRoomCache.get(agitId);
  if (cached?.raw === raw) {
    return cached.history;
  }
  try {
    const history = JSON.parse(raw) as RoomHistoryCache;
    const sanitized: RoomHistoryCache = {
      ...history,
      messages: history.messages.map(stripUnreadMemberCount),
    };
    parsedRoomCache.set(agitId, { raw, history: sanitized });
    return sanitized;
  } catch {
    parsedRoomCache.delete(agitId);
    return null;
  }
}

export function clearRoomHistoryCache(agitId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(storageKey(agitId));
  parsedRoomCache.delete(agitId);
}

export function mergeChatMessages(existing: UiChatMessage[], incoming: UiChatMessage[]): UiChatMessage[] {
  const map = new Map<string, UiChatMessage>();
  for (const message of existing) {
    map.set(message.id, message);
  }
  for (const message of incoming) {
    const previous = map.get(message.id);
    if (!previous) {
      map.set(message.id, message);
      continue;
    }
    map.set(message.id, {
      ...previous,
      ...message,
      content: previous.type === "SYSTEM" ? previous.content : message.content,
      unreadMemberCount:
        message.unreadMemberCount !== undefined && message.unreadMemberCount !== null
          ? message.unreadMemberCount
          : previous.unreadMemberCount,
    });
  }
  return [...map.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}
