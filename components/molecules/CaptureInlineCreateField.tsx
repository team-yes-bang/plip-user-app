"use client";

import { DailyIcon, IconButton } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { AnimatedBottomSheet } from "@/components/molecules/AnimatedOverlays";
import { CaptureCreateForm } from "@/components/molecules/CaptureCreateForm";
import { useState } from "react";

type CaptureInlineCreateFieldProps = {
  label: string;
  title: string;
  idPrefix: string;
  nameLabel: string;
  placeholder: string;
  hint: string;
  actionLabel: string;
  maxLength: number;
  busy?: boolean;
  error?: string | null;
  noticeTitle?: string;
  noticeBody?: string;
  onSubmit: (value: string) => void | Promise<void>;
};

export function CaptureInlineCreateField({
  label,
  title,
  idPrefix,
  nameLabel,
  placeholder,
  hint,
  actionLabel,
  maxLength,
  busy = false,
  error = null,
  noticeTitle,
  noticeBody,
  onSubmit,
}: CaptureInlineCreateFieldProps) {
  const [open, setOpen] = useState(false);
  const titleId = `${idPrefix}-sheet-title`;

  function handleClose() {
    if (busy) {
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={`${ui.link} cursor-pointer border-0 bg-transparent p-0 text-left`}
        onClick={() => setOpen(true)}
      >
        + {label}
      </button>

      <AnimatedBottomSheet
        open={open}
        onClose={handleClose}
        labelledBy={titleId}
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id={titleId}
            className="m-0 text-lg font-bold font-[family-name:var(--font-title)] text-[var(--dl-color-text-primary)]"
          >
            {title}
          </h2>
          <IconButton variant="surface" label="닫기" disabled={busy} onClick={handleClose}>
            <DailyIcon name="x" size={18} />
          </IconButton>
        </div>
        <CaptureCreateForm
          idPrefix={idPrefix}
          nameLabel={nameLabel}
          placeholder={placeholder}
          hint={hint}
          maxLength={maxLength}
          submitLabel={actionLabel}
          busy={busy}
          error={error}
          noticeTitle={noticeTitle}
          noticeBody={noticeBody}
          onSubmit={onSubmit}
        />
      </AnimatedBottomSheet>
    </>
  );
}
