"use client";

import { issueChatWsTicketAction } from "@/actions/chatActions";
import { incrementAgitChatUnread } from "@/lib/chat/chatUnreadStore";
import type { ApiChatMessage } from "@/types/chat/api";
import type { UiAgit } from "@/types/agit/ui";
import { Client } from "@stomp/stompjs";
import { useEffect, useMemo, useRef } from "react";
import SockJS from "sockjs-client";

type UseAgitListChatSyncOptions = {
  items: UiAgit[];
  currentUserUuid?: string;
  enabled?: boolean;
};

function normalizeAgitId(agitId: string): string {
  return agitId.trim().toLowerCase();
}

export function useAgitListChatSync({
  items,
  currentUserUuid,
  enabled = false,
}: UseAgitListChatSyncOptions) {
  const wsUrlRef = useRef("");
  const unreadByAgitIdRef = useRef<Map<string, number>>(new Map());
  const agitIdsKey = useMemo(
    () =>
      items
        .map((item) => item.id)
        .sort()
        .join(","),
    [items],
  );

  useEffect(() => {
    unreadByAgitIdRef.current = new Map(
      items.map((item) => [normalizeAgitId(item.id), item.chatUnreadCount ?? 0]),
    );
  }, [items]);

  useEffect(() => {
    if (!enabled || !currentUserUuid || !agitIdsKey) {
      return;
    }

    const agitIds = agitIdsKey.split(",").filter(Boolean);
    const normalizedCurrentUserUuid = currentUserUuid.trim().toLowerCase();

    const client = new Client({
      reconnectDelay: 5000,
      beforeConnect: async () => {
        const result = await issueChatWsTicketAction();
        if (!result.ok) {
          throw new Error(result.error);
        }
        wsUrlRef.current = result.data.wsUrl;
      },
      webSocketFactory: () => new SockJS(wsUrlRef.current),
      onConnect: () => {
        for (const agitId of agitIds) {
          client.subscribe(`/sub/agits/${agitId}`, (frame) => {
            try {
              const payload = JSON.parse(frame.body) as ApiChatMessage;
              if (payload.type !== "TALK" || !payload.senderUuid) {
                return;
              }
              if (payload.senderUuid.trim().toLowerCase() === normalizedCurrentUserUuid) {
                return;
              }
              const agitId = normalizeAgitId(payload.agitUuid);
              const fallback = unreadByAgitIdRef.current.get(agitId) ?? 0;
              incrementAgitChatUnread(agitId, fallback);
              unreadByAgitIdRef.current.set(agitId, fallback + 1);
            } catch {
              // 수신 payload 파싱 실패는 무시
            }
          });
        }
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [agitIdsKey, currentUserUuid, enabled]);
}
