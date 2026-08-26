"use client";

import { getChatHistoryAction, markChatReadAction } from "@/actions/chatActions";
import {
  ChatComposer,
  ChatRoomMessage,
  NotificationIconToggle,
  PageContainer,
  ScreenHeader,
} from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import { useAgitChatSocket } from "@/hooks/useAgitChatSocket";
import { createLocalTalkMessage } from "@/lib/chat/createLocalMessage";
import { formatChatDateLabel, isSameChatDay, isSameChatMessageGroup, shouldShowChatMessageTime } from "@/lib/chat/formatMessageTime";
import { normalizeChatDraft } from "@/lib/chat/limits";
import { mapApiChatMessage } from "@/lib/chat/mapMessage";
import {
  mergeChatMessages,
  readRoomHistoryCache,
  writeRoomHistoryCache,
} from "@/lib/chat/roomHistoryCache";
import { setAgitChatUnread } from "@/lib/chat/chatUnreadStore";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiAgit } from "@/types/agit/ui";
import type { ApiChatReceiptPayload } from "@/types/chat/api";
import type { UiChatHistory, UiChatMessage } from "@/types/chat/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RoomChatSectionProps = {
  agit: UiAgit;
  initialHistory: UiChatHistory;
  members: ApiAgitDetailMember[];
  currentUserUuid?: string;
  enableRemoteChat?: boolean;
};

function mergeMessages(existing: UiChatMessage[], incoming: UiChatMessage[]): UiChatMessage[] {
  return mergeChatMessages(existing, incoming);
}

function scrollToBottom(container: HTMLElement | null) {
  if (!container) {
    return;
  }
  container.scrollTop = container.scrollHeight;
}

export function RoomChatSection({
  agit,
  initialHistory,
  members,
  currentUserUuid,
  enableRemoteChat = false,
}: RoomChatSectionProps) {
  const [notify, setNotify] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialHistory.messages);
  const [nextCursor, setNextCursor] = useState(initialHistory.nextCursor);
  const [hasNext, setHasNext] = useState(initialHistory.hasNext);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const listRef = useRef<HTMLElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const messagesRef = useRef(messages);
  const nextCursorRef = useRef(nextCursor);
  const hasNextRef = useRef(hasNext);
  const lastMarkedMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    nextCursorRef.current = nextCursor;
    hasNextRef.current = hasNext;
  }, [hasNext, messages, nextCursor]);

  const handleIncomingMessage = useCallback(
    (payload: Parameters<typeof mapApiChatMessage>[0]) => {
      const mapped = mapApiChatMessage(payload, members, currentUserUuid);
      const withUnreadCount =
        mapped.type === "TALK" && mapped.unreadMemberCount === undefined
          ? {
              ...mapped,
              unreadMemberCount: Math.max(0, members.length - 1),
            }
          : mapped;
      setMessages((current) => mergeMessages(current, [withUnreadCount]));
    },
    [currentUserUuid, members],
  );

  const handleIncomingReceipt = useCallback((payload: ApiChatReceiptPayload) => {
    const receiptMessageId = payload.messageId.toLowerCase();
    setMessages((current) =>
      current.map((message) =>
        message.id.toLowerCase() === receiptMessageId
          ? { ...message, unreadMemberCount: payload.unreadMemberCount }
          : message,
      ),
    );
  }, []);

  const { sendMessage: sendRemoteMessage } = useAgitChatSocket({
    agitUuid: agit.id,
    enabled: enableRemoteChat && Boolean(currentUserUuid),
    onMessage: handleIncomingMessage,
    onReceipt: handleIncomingReceipt,
  });

  const markReadUpToLatest = useCallback(() => {
    const latest = messagesRef.current.at(-1);
    if (!latest) {
      return;
    }
    if (lastMarkedMessageIdRef.current === latest.id) {
      return;
    }
    lastMarkedMessageIdRef.current = latest.id;
    void markChatReadAction(agit.id, new Date().toISOString()).then((result) => {
      if (result.ok) {
        setAgitChatUnread(agit.id, 0);
      }
    });
  }, [agit.id]);

  useEffect(() => {
    if (!enableRemoteChat || messages.length === 0) {
      return;
    }
    markReadUpToLatest();
  }, [enableRemoteChat, markReadUpToLatest, messages]);

  useEffect(() => {
    if (!enableRemoteChat) {
      return;
    }
    return () => {
      const latest = messagesRef.current.at(-1);
      if (!latest) {
        return;
      }
      void markChatReadAction(agit.id, new Date().toISOString()).then((result) => {
        if (result.ok) {
          setAgitChatUnread(agit.id, 0);
        }
      });
    };
  }, [agit.id, enableRemoteChat]);

  useEffect(() => {
    if (!enableRemoteChat) {
      return;
    }
    const cached = readRoomHistoryCache(agit.id);
    if (!cached) {
      return;
    }
    // SSR 초기값 이후 sessionStorage 캐시 병합
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 1회 클라이언트 캐시 반영
    setMessages((current) => mergeMessages(current, cached.messages));
    setNextCursor((current) => cached.nextCursor ?? current);
    setHasNext((current) => cached.hasNext ?? current);
  }, [agit.id, enableRemoteChat]);

  useEffect(() => {
    if (!enableRemoteChat) {
      return;
    }
    writeRoomHistoryCache(agit.id, { messages, nextCursor, hasNext });
    return () => {
      writeRoomHistoryCache(agit.id, {
        messages: messagesRef.current,
        nextCursor: nextCursorRef.current,
        hasNext: hasNextRef.current,
      });
    };
  }, [agit.id, enableRemoteChat, hasNext, messages, nextCursor]);

  useEffect(() => {
    if (!enableRemoteChat) {
      return;
    }
    let cancelled = false;
    void getChatHistoryAction(agit.id).then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      setMessages((current) => mergeMessages(current, result.data.messages));
      setNextCursor(result.data.nextCursor);
      setHasNext(result.data.hasNext);
    });
    return () => {
      cancelled = true;
    };
  }, [agit.id, enableRemoteChat]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) {
      return;
    }
    scrollToBottom(listRef.current);
  }, [messages]);

  const loadOlderMessages = useCallback(async () => {
    if (!enableRemoteChat || !hasNext || !nextCursor || loadingOlder) {
      return;
    }
    setLoadingOlder(true);
    const result = await getChatHistoryAction(agit.id, {
      cursorCreatedAt: nextCursor.createdAt,
      cursorId: nextCursor.id,
    });
    setLoadingOlder(false);
    if (!result.ok) {
      return;
    }
    const container = listRef.current;
    const previousHeight = container?.scrollHeight ?? 0;
    setMessages((current) => mergeMessages(result.data.messages, current));
    setNextCursor(result.data.nextCursor);
    setHasNext(result.data.hasNext);
    requestAnimationFrame(() => {
      if (!container) {
        return;
      }
      container.scrollTop = container.scrollHeight - previousHeight;
    });
  }, [agit.id, enableRemoteChat, hasNext, loadingOlder, nextCursor]);

  const handleScroll = useCallback(() => {
    const container = listRef.current;
    if (!container) {
      return;
    }
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 80;
    if (enableRemoteChat && container.scrollTop < 48) {
      void loadOlderMessages();
    }
  }, [enableRemoteChat, loadOlderMessages]);

  const renderedMessages = useMemo(
    () =>
      messages.map((message, index) => {
        const previous = index > 0 ? messages[index - 1] : null;
        const next = index < messages.length - 1 ? messages[index + 1] : null;
        const showDateLabel = !previous || !isSameChatDay(previous.createdAt, message.createdAt);
        const isGroupedWithPrevious = Boolean(
          previous && !showDateLabel && isSameChatMessageGroup(message, previous),
        );
        return {
          message,
          dateLabel: showDateLabel ? formatChatDateLabel(message.createdAt) : null,
          showTimeLabel: shouldShowChatMessageTime(message, next),
          isGroupedWithPrevious,
        };
      }),
    [messages],
  );

  const handleSend = useCallback(() => {
    const content = normalizeChatDraft(draft);
    if (!content) {
      return;
    }

    if (enableRemoteChat) {
      const sent = sendRemoteMessage(content);
      if (!sent) {
        return;
      }
    } else {
      const localMessage = createLocalTalkMessage(agit.id, content, currentUserUuid);
      setMessages((current) => mergeMessages(current, [localMessage]));
    }

    shouldStickToBottomRef.current = true;
    setDraft("");
    requestAnimationFrame(() => scrollToBottom(listRef.current));
  }, [agit.id, currentUserUuid, draft, enableRemoteChat, sendRemoteMessage]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        backHref={ROUTES.agit.detail(agit.id)}
        title={agit.name}
        trailing={
          <NotificationIconToggle checked={notify} label="채팅 알림" onChange={setNotify} />
        }
      />

      <PageContainer
        ref={listRef}
        as="div"
        gap="none"
        aria-label="아지트 채팅"
        className="flex-1 pb-[12px]"
        onScroll={handleScroll}
      >
        {loadingOlder ? (
          <p className="m-0 text-center text-xs text-[var(--dl-color-text-tertiary)]">
            이전 메시지 불러오는 중
          </p>
        ) : null}
        {renderedMessages.length === 0 ? (
          <p className="m-[24px_0] text-center text-sm text-[var(--dl-color-text-secondary)]">
            메시지를 입력해 대화를 시작하세요.
          </p>
        ) : (
          renderedMessages.map(({ message, dateLabel, showTimeLabel, isGroupedWithPrevious }, index) => (
            <div
              key={message.id}
              className={isGroupedWithPrevious ? "mt-1" : index === 0 ? "" : "mt-[18px]"}
            >
              {dateLabel ? (
                <p className="m-[8px_0_18px] text-center text-xs font-medium text-[var(--dl-color-text-tertiary)]">
                  {dateLabel}
                </p>
              ) : null}
              <ChatRoomMessage
                agitId={agit.id}
                message={message}
                showTimeLabel={showTimeLabel}
                compact={isGroupedWithPrevious}
              />
            </div>
          ))
        )}
      </PageContainer>

      <PageContainer as="div" gap="none" className="flex-none overflow-hidden pb-[12px]">
        <ChatComposer value={draft} onChange={setDraft} onSubmit={handleSend} />
      </PageContainer>
    </div>
  );
}
