"use client";

import { getChatHistoryAction, markChatReadAction } from "@/actions/chatActions";
import {
  ChatComposer,
  ChatRoomMessage,
  HeaderBackLink,
  HeaderMenuButton,
  ScreenHeader,
} from "@/components/molecules";
import { ChatMoreSheet } from "@/components/organisms/ChatMoreSheet";
import { NotificationIconToggle } from "@/components/molecules/NotificationIconToggle";
import { ROUTES } from "@/config/routes";
import { useAgitChatSocket } from "@/hooks/useAgitChatSocket";
import { createLocalTalkMessage } from "@/lib/chat/createLocalMessage";
import { formatChatDateLabel, isSameChatDay, isSameChatMessageGroup, shouldShowChatMessageTime } from "@/lib/chat/formatMessageTime";
import { normalizeChatDraft } from "@/lib/chat/limits";
import { mapApiChatMessage } from "@/lib/chat/mapMessage";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiAgit } from "@/types/agit/ui";
import type { UiChatHistory, UiChatMessage } from "@/types/chat/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RoomChatSectionProps = {
  agit: UiAgit;
  initialHistory: UiChatHistory;
  members: ApiAgitDetailMember[];
  currentUserUuid?: string;
  enableRemoteChat?: boolean;
  chatWsUrl?: string;
};

function mergeMessages(existing: UiChatMessage[], incoming: UiChatMessage[]): UiChatMessage[] {
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

function scrollToBottom(container: HTMLDivElement | null) {
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
  chatWsUrl,
}: RoomChatSectionProps) {
  const [notify, setNotify] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialHistory.messages);
  const [nextCursor, setNextCursor] = useState(initialHistory.nextCursor);
  const [hasNext, setHasNext] = useState(initialHistory.hasNext);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);

  const handleIncomingMessage = useCallback(
    (payload: Parameters<typeof mapApiChatMessage>[0]) => {
      const mapped = mapApiChatMessage(payload, members, currentUserUuid);
      setMessages((current) => mergeMessages(current, [mapped]));
    },
    [currentUserUuid, members],
  );

  const { sendMessage: sendRemoteMessage } = useAgitChatSocket({
    agitUuid: agit.id,
    userUuid: currentUserUuid ?? "",
    wsUrl: chatWsUrl ?? "",
    enabled: enableRemoteChat && Boolean(currentUserUuid && chatWsUrl),
    onMessage: handleIncomingMessage,
  });

  useEffect(() => {
    if (!enableRemoteChat) {
      return;
    }
    void markChatReadAction(agit.id);
    return () => {
      void markChatReadAction(agit.id);
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
    <section
      className="flex h-full min-h-0 flex-col overflow-hidden p-[12px_23px_16px]"
      aria-label="아지트 채팅"
    >
      <ScreenHeader
        tone="plain"
        className="shrink-0"
        leading={<HeaderBackLink href={ROUTES.agit.detail(agit.id)} />}
        title={agit.name}
        subtitle="채팅"
        trailing={
          <>
            <NotificationIconToggle checked={notify} label="채팅 알림" onChange={setNotify} />
            <HeaderMenuButton label="더보기" expanded={menuOpen} onClick={() => setMenuOpen(true)} />
          </>
        }
      />

      <div
        ref={listRef}
        className="mt-[8px] min-h-0 flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="flex flex-col">
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
        </div>
      </div>

      <div className="shrink-0 pt-[8px]">
        <ChatComposer value={draft} onChange={setDraft} onSubmit={handleSend} />
      </div>

      <ChatMoreSheet
        agit={agit}
        members={members}
        currentUserUuid={currentUserUuid}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </section>
  );
}
