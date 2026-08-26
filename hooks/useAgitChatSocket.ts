"use client";

import { issueChatWsTicketAction } from "@/actions/chatActions";
import type { ApiChatMessage, ApiChatReceiptPayload } from "@/types/chat/api";
import { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";

type UseAgitChatSocketOptions = {
  agitUuid: string;
  enabled?: boolean;
  onMessage: (message: ApiChatMessage) => void;
  onReceipt?: (receipt: ApiChatReceiptPayload) => void;
};

export function useAgitChatSocket({
  agitUuid,
  enabled = true,
  onMessage,
  onReceipt,
}: UseAgitChatSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  const onReceiptRef = useRef(onReceipt);
  const wsUrlRef = useRef("");

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onReceiptRef.current = onReceipt;
  }, [onReceipt]);

  useEffect(() => {
    if (!enabled || !agitUuid) {
      return;
    }

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
        client.subscribe(`/sub/agits/${agitUuid}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body) as ApiChatMessage;
            onMessageRef.current(payload);
          } catch {
            // 수신 payload 파싱 실패는 무시
          }
        });
        client.subscribe(`/sub/agits/${agitUuid}/receipts`, (frame) => {
          try {
            const payload = JSON.parse(frame.body) as ApiChatReceiptPayload;
            onReceiptRef.current?.(payload);
          } catch {
            // receipt payload 파싱 실패는 무시
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
  }, [agitUuid, enabled]);

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
