import type { UiChatHistory, UiChatMessage } from "@/types/chat/ui";

const ROOM_PREFIX = "plip-chat-room:";

type RoomHistoryCache = UiChatHistory;

type ParsedRoomCacheEntry = {
  raw: string;
  history: RoomHistoryCache;
};

const parsedRoomCache = new Map<string, ParsedRoomCacheEntry>();

function storageKey(agitId: string): string {
  return `${ROOM_PREFIX}${agitId}`;
}

export function writeRoomHistoryCache(agitId: string, history: RoomHistoryCache): void {
  if (typeof window === "undefined") {
    return;
  }
  const raw = JSON.stringify(history);
  sessionStorage.setItem(storageKey(agitId), raw);
  parsedRoomCache.set(agitId, { raw, history });
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
    parsedRoomCache.set(agitId, { raw, history });
    return history;
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
    map.set(message.id, message);
  }
  return [...map.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}
