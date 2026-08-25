import type { UiChatMessage } from "@/types/chat/ui";

const STORAGE_PREFIX = "plip-chat-message:";

type ParsedCacheEntry = {
  raw: string;
  message: UiChatMessage | null;
};

const parsedCache = new Map<string, ParsedCacheEntry>();

function storageKey(messageId: string): string {
  return `${STORAGE_PREFIX}${messageId}`;
}

export function cacheChatMessage(message: UiChatMessage): void {
  if (typeof window === "undefined") {
    return;
  }
  const raw = JSON.stringify(message);
  sessionStorage.setItem(storageKey(message.id), raw);
  parsedCache.set(message.id, { raw, message });
}

export function readCachedChatMessage(messageId: string): UiChatMessage | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(storageKey(messageId));
  if (!raw) {
    parsedCache.delete(messageId);
    return null;
  }
  const cached = parsedCache.get(messageId);
  if (cached?.raw === raw) {
    return cached.message;
  }
  try {
    const message = JSON.parse(raw) as UiChatMessage;
    parsedCache.set(messageId, { raw, message });
    return message;
  } catch {
    parsedCache.set(messageId, { raw, message: null });
    return null;
  }
}

export function removeCachedChatMessage(messageId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(storageKey(messageId));
  parsedCache.delete(messageId);
}
