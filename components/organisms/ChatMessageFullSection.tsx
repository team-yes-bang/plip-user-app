"use client";

import { UserAvatar } from "@/components/atoms";
import { PageContainer, ScreenHeader } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import { readCachedChatMessage } from "@/lib/chat/messageCache";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

type ChatMessageFullSectionProps = {
  agitId: string;
  messageId: string;
};

function subscribeNoop() {
  return () => {};
}

export function ChatMessageFullSection({ agitId, messageId }: ChatMessageFullSectionProps) {
  const router = useRouter();
  const message = useSyncExternalStore(
    subscribeNoop,
    () => readCachedChatMessage(messageId),
    () => null,
  );

  useEffect(() => {
    if (!message) {
      router.replace(ROUTES.agit.chat(agitId));
    }
  }, [agitId, message, router]);

  if (!message) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        backHref={ROUTES.agit.chat(agitId)}
        title="전체보기"
      />

      <PageContainer aria-label="메시지 전체보기" className="flex-1">
      <article className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {!message.isMine && message.profileImageSrc ? (
            <UserAvatar src={message.profileImageSrc} size={40} className="border-0 bg-[var(--dl-color-bg-surface)]" />
          ) : null}
          <div>
            <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">{message.senderName}</p>
            {message.timeLabel ? (
              <p className="m-0 text-xs text-[var(--dl-color-text-tertiary)]">{message.timeLabel}</p>
            ) : null}
          </div>
        </div>

        <p
          className={`m-0 whitespace-pre-wrap break-words text-sm leading-6 ${
            message.isMine
              ? "rounded-2xl bg-[var(--dl-color-bg-brand)] p-4 text-[var(--dl-color-text-inverse)]"
              : "rounded-2xl bg-[var(--dl-color-bg-surface)] p-4 text-[var(--dl-color-text-primary)]"
          }`}
        >
          {message.content}
        </p>
      </article>
      </PageContainer>
    </div>
  );
}
