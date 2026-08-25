"use client";

import { ArrowUp } from "lucide-react";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/lib/chat/limits";
import { useEffect, useRef } from "react";

type ChatComposerProps = {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ChatComposer({
  value,
  placeholder = "메시지를 입력하세요",
  disabled = false,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && value.trim().length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    if (canSend) {
      onSubmit();
    }
  };

  return (
    <form
      className="flex items-end gap-[4px] rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] p-[4px_4px_4px_12px]"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) {
          onSubmit();
        }
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        maxLength={MAX_CHAT_MESSAGE_LENGTH}
        className="max-h-[96px] min-h-[20px] flex-1 resize-none border-0 bg-[transparent] py-[6px] text-[13px] leading-5 text-[var(--dl-color-text-primary)] [outline:none] placeholder:text-[var(--dl-color-text-tertiary)]"
        value={value}
        placeholder={placeholder}
        aria-label="메시지 입력"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        className="mb-[2px] grid size-8 shrink-0 place-items-center border-0 bg-[transparent] disabled:opacity-30"
        aria-label="전송"
        disabled={!canSend}
      >
        <ArrowUp
          className={`size-5 ${canSend ? "text-[var(--dl-color-text-brand)]" : "text-[var(--dl-color-text-tertiary)]"}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </form>
  );
}
