"use client";

import { ROUTES } from "@/config/routes";
import { CHAT_BUBBLE_COLLAPSED_MAX_HEIGHT } from "@/lib/chat/limits";
import { cacheChatMessage } from "@/lib/chat/messageCache";
import type { UiChatMessage } from "@/types/chat/ui";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type ChatMessageBodyProps = {
  agitId: string;
  message: UiChatMessage;
  bubbleClassName: string;
  textClassName: string;
  timeLabel?: string;
  bubbleLeading?: ReactNode;
  bubbleTrailing?: ReactNode;
  actionClassName?: string;
};

export function ChatMessageBody({
  agitId,
  message,
  bubbleClassName,
  textClassName,
  timeLabel,
  bubbleLeading,
  bubbleTrailing,
  actionClassName = "text-[var(--dl-color-text-brand)]",
}: ChatMessageBodyProps) {
  const router = useRouter();
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const timeRef = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [metaRowWidth, setMetaRowWidth] = useState<number>();

  useLayoutEffect(() => {
    const element = bodyRef.current;
    if (!element) {
      return;
    }
    setTruncated(element.scrollHeight > element.clientHeight + 1);
  }, [message.content]);

  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) {
      return;
    }

    const bubbleWidth = bubble.getBoundingClientRect().width;
    if (truncated && timeLabel) {
      const actionWidth = actionRef.current?.getBoundingClientRect().width ?? 0;
      const timeWidth = timeRef.current?.getBoundingClientRect().width ?? 0;
      setMetaRowWidth(Math.max(bubbleWidth, actionWidth + timeWidth + 8));
      return;
    }

    setMetaRowWidth(undefined);
  }, [message.content, timeLabel, truncated]);

  const openFullView = () => {
    cacheChatMessage(message);
    router.push(ROUTES.agit.chatMessage(agitId, message.id));
  };

  const showMetaRow = truncated || Boolean(timeLabel);
  const showSplitMetaRow = truncated && Boolean(timeLabel);

  return (
    <div className={`flex max-w-full flex-col gap-1 ${message.isMine ? "items-end" : "items-start"}`}>
      <div className={`flex max-w-full items-end gap-1 ${message.isMine ? "justify-end" : ""}`}>
        {bubbleLeading}
        <div ref={bubbleRef} className={bubbleClassName}>
          <div
            ref={bodyRef}
            className={`overflow-hidden whitespace-pre-wrap break-words ${textClassName}`}
            style={{ maxHeight: CHAT_BUBBLE_COLLAPSED_MAX_HEIGHT }}
          >
            {message.content}
          </div>
        </div>
        {bubbleTrailing}
      </div>
      {showMetaRow ? (
        showSplitMetaRow ? (
          <div
            className="flex items-center justify-between gap-2"
            style={metaRowWidth ? { width: metaRowWidth } : undefined}
          >
            {message.isMine ? (
              <>
                <button
                  ref={actionRef}
                  type="button"
                  className={`border-0 bg-[transparent] p-0 text-xs font-medium ${actionClassName}`}
                  onClick={openFullView}
                >
                  전체보기
                </button>
                <p ref={timeRef} className="m-0 shrink-0 text-[11px] text-[var(--dl-color-text-tertiary)]">
                  {timeLabel}
                </p>
              </>
            ) : (
              <>
                <p ref={timeRef} className="m-0 shrink-0 text-[11px] text-[var(--dl-color-text-tertiary)]">
                  {timeLabel}
                </p>
                <button
                  ref={actionRef}
                  type="button"
                  className={`border-0 bg-[transparent] p-0 text-xs font-medium ${actionClassName}`}
                  onClick={openFullView}
                >
                  전체보기
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={`flex w-fit items-center gap-2 ${message.isMine && truncated ? "self-start" : ""}`}>
            {message.isMine ? (
              <>
                {truncated ? (
                  <button
                    type="button"
                    className={`border-0 bg-[transparent] p-0 text-xs font-medium ${actionClassName}`}
                    onClick={openFullView}
                  >
                    전체보기
                  </button>
                ) : null}
                {timeLabel ? (
                  <p className="m-0 shrink-0 text-[11px] text-[var(--dl-color-text-tertiary)]">{timeLabel}</p>
                ) : null}
              </>
            ) : (
              <>
                {timeLabel ? (
                  <p className="m-0 shrink-0 text-[11px] text-[var(--dl-color-text-tertiary)]">{timeLabel}</p>
                ) : null}
                {truncated ? (
                  <button
                    type="button"
                    className={`border-0 bg-[transparent] p-0 text-xs font-medium ${actionClassName}`}
                    onClick={openFullView}
                  >
                    전체보기
                  </button>
                ) : null}
              </>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}
