import { UserAvatar } from "@/components/atoms/UserAvatar";
import { ChatMessageBody } from "@/components/molecules/ChatMessageBody";
import type { UiChatMessage } from "@/types/chat/ui";
import { SystemMessageRow } from "@/components/molecules/SystemMessageRow";

type ChatRoomMessageProps = {
  agitId: string;
  message: UiChatMessage;
  showTimeLabel?: boolean;
  compact?: boolean;
};

export function ChatRoomMessage({
  agitId,
  message,
  showTimeLabel = true,
  compact = false,
}: ChatRoomMessageProps) {
  if (message.type === "SYSTEM") {
    return <SystemMessageRow content={message.content} />;
  }

  const timeLabel = showTimeLabel ? message.timeLabel : undefined;

  if (message.isMine) {
    return (
      <article className="flex justify-end gap-2">
        <div className="flex max-w-[276px] flex-col items-end">
          <ChatMessageBody
            agitId={agitId}
            message={message}
            timeLabel={timeLabel}
            bubbleClassName="w-fit max-w-full rounded-2xl bg-[var(--dl-color-bg-brand)] px-3 py-2.5"
            textClassName="text-sm leading-5 text-[var(--dl-color-text-inverse)]"
            actionClassName="text-[var(--dl-color-text-brand)]"
          />
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-2">
      {compact ? (
        <span className="size-9 shrink-0" aria-hidden />
      ) : message.profileImageSrc ? (
        <UserAvatar src={message.profileImageSrc} size={36} className="border-0 bg-[var(--dl-color-bg-surface)]" />
      ) : (
        <span className="size-9 shrink-0 rounded-full bg-[var(--dl-color-bg-surface)]" aria-hidden />
      )}
      <div className="flex max-w-[276px] flex-col gap-1">
        {!compact ? (
          <p className="m-0 text-xs font-medium text-[var(--dl-color-text-secondary)]">{message.senderName}</p>
        ) : null}
        <ChatMessageBody
          agitId={agitId}
          message={message}
          timeLabel={timeLabel}
          bubbleClassName="w-fit max-w-full rounded-2xl bg-[var(--dl-color-bg-surface)] px-3 py-2.5"
          textClassName="text-sm leading-5 text-[var(--dl-color-text-primary)]"
        />
      </div>
    </article>
  );
}
