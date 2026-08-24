"use client";

import { Input, SubmitButton } from "@/components/atoms";
import { useState } from "react";

type CaptureInlineCreateFieldProps = {
  label: string;
  placeholder: string;
  actionLabel: string;
  maxLength?: number;
  busy?: boolean;
  error?: string | null;
  onSubmit: (value: string) => void | Promise<void>;
};

export function CaptureInlineCreateField({
  label,
  placeholder,
  actionLabel,
  maxLength,
  busy = false,
  error = null,
  onSubmit,
}: CaptureInlineCreateFieldProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        className="self-start border-0 bg-transparent p-0 text-[13px] font-medium text-[var(--dl-color-text-brand)]"
        onClick={() => setOpen(true)}
      >
        + {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-3">
      <Input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        variant="daily"
        disabled={busy}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <SubmitButton
          type="button"
          variant="brand"
          className="!w-auto shrink-0 px-4"
          disabled={busy || !value.trim()}
          onClick={() => void onSubmit(value.trim())}
        >
          {busy ? "만드는 중…" : actionLabel}
        </SubmitButton>
        <button
          type="button"
          className="min-h-11 rounded-[var(--dl-radius-md)] px-3 text-[13px] font-medium text-[var(--dl-color-text-secondary)]"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setValue("");
          }}
        >
          취소
        </button>
      </div>
      {error ? (
        <p className="m-0 text-[12px] text-[#d84545]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
