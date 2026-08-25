"use client";

import { HeaderBackLink, ScreenHeader } from "@/components/molecules";
import { UserAvatar } from "@/components/atoms/UserAvatar";
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
    <section className="flex min-h-[calc(100dvh_-_80px)] flex-col p-[12px_23px_16px]" aria-label="메시지 전체보기">
      <ScreenHeader
        tone="plain"
        leading={<HeaderBackLink href={ROUTES.agit.chat(agitId)} />}
        title="메시지"
      />

      <article className="mt-6 flex flex-col gap-3">
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
    </section>
  );
}
