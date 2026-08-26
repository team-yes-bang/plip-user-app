"use client";

import {
  getAgitChatUnreadSnapshot,
  subscribeAgitChatUnread,
} from "@/lib/chat/chatUnreadStore";
import { useSyncExternalStore } from "react";

export function useAgitChatUnread(agitId: string, initialCount: number): number {
  return useSyncExternalStore(
    subscribeAgitChatUnread,
    () => getAgitChatUnreadSnapshot(agitId, initialCount),
    () => initialCount,
  );
}
