import type { UiChatMessage } from "@/types/chat/ui";

const STORAGE_PREFIX = "plip-chat-message:";

export function cacheChatMessage(message: UiChatMessage): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(`${STORAGE_PREFIX}${message.id}`, JSON.stringify(message));
}

export function readCachedChatMessage(messageId: string): UiChatMessage | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${messageId}`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UiChatMessage;
  } catch {
    return null;
  }
}

export function removeCachedChatMessage(messageId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(`${STORAGE_PREFIX}${messageId}`);
}
