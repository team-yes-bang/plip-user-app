"use client";

import type { ApiChatMessage } from "@/types/chat/api";
import { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";

type UseAgitChatSocketOptions = {
  agitUuid: string;
  userUuid: string;
  wsUrl: string;
  enabled?: boolean;
  onMessage: (message: ApiChatMessage) => void;
};

export function useAgitChatSocket({
  agitUuid,
  userUuid,
  wsUrl,
  enabled = true,
  onMessage,
}: UseAgitChatSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !agitUuid || !userUuid || !wsUrl) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        "X-User-UUID": userUuid,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/sub/agits/${agitUuid}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body) as ApiChatMessage;
            onMessageRef.current(payload);
          } catch {
            // 수신 payload 파싱 실패는 무시
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [agitUuid, enabled, userUuid, wsUrl]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || !clientRef.current?.connected) {
      return false;
    }
    clientRef.current.publish({
      destination: `/app/agits/${agitUuid}/send`,
      body: JSON.stringify({ content: trimmed }),
    });
    return true;
  };

  return { sendMessage };
}
