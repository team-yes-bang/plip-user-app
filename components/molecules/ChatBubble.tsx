import type { UiCardChatMessage } from "@/types/agit/ui";

type ChatBubbleProps = {
  message: UiCardChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <article className={`flex w-[min(280px,_100%)] flex-col gap-[8px] border border-[var(--dl-color-border-default)] rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] p-[12px] ${message.isMine ? "[align-self:flex-end] border-0 bg-[var(--dl-color-bg-brand)] m-dlBubbleMine" : ""}`}>
      <div className="flex w-full items-center justify-between gap-[8px]">
        <p className="m-0 text-xs font-semibold text-[var(--dl-color-text-primary)] text-[var(--dl-color-text-inverse)]">{message.senderName}</p>
        {message.time ? <p className="m-0 text-xs text-[var(--dl-color-text-tertiary)] text-[var(--dl-color-text-inverse)] opacity-[0.78]">{message.time}</p> : null}
      </div>
      {message.replyTo ? (
        <div className="flex w-full flex-col gap-[4px] rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-brand-subtle)] p-[8px_10px]">
          <p className="m-0 text-xs font-semibold text-[var(--dl-color-text-brand)]">{message.replyTo.name}에게 답장</p>
          <p className="m-0 text-xs text-[var(--dl-color-text-secondary)]">{message.replyTo.excerpt}</p>
        </div>
      ) : null}
      <p className="m-0 text-sm leading-5 text-[var(--dl-color-text-primary)] text-[var(--dl-color-text-inverse)]">{message.body}</p>
    </article>
  );
}
