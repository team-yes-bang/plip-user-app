"use client";

import { SubmitButton } from "@/components/atoms";
import { AuthField } from "@/components/molecules/AuthField";
import { NoticeCard } from "@/components/molecules/NoticeCard";

export const CAPTURE_TOPIC_CREATE_NOTICE = {
  title: "등록 규칙",
  body: "한 사용자는 이 토픽에 영상 1개만 등록할 수 있어요. 진행 날짜는 하루입니다.",
} as const;

type CaptureCreateFormProps = {
  idPrefix: string;
  nameLabel: string;
  placeholder: string;
  hint: string;
  maxLength: number;
  submitLabel: string;
  busy?: boolean;
  error?: string | null;
  noticeTitle?: string;
  noticeBody?: string;
  onSubmit: (value: string) => void | Promise<void>;
};

export function CaptureCreateForm({
  idPrefix,
  nameLabel,
  placeholder,
  hint,
  maxLength,
  submitLabel,
  busy = false,
  error = null,
  noticeTitle,
  noticeBody,
  onSubmit,
}: CaptureCreateFormProps) {
  async function handleSubmit(formData: FormData) {
    if (busy) {
      return;
    }

    const value = String(formData.get("name") ?? "").trim();
    if (!value) {
      return;
    }

    await onSubmit(value);
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <AuthField
        id={`${idPrefix}-name`}
        name="name"
        label={nameLabel}
        hint={hint}
        placeholder={placeholder}
        maxLength={maxLength}
        required
        disabled={busy}
      />
      {noticeTitle && noticeBody ? (
        <NoticeCard tone="brand" title={noticeTitle} body={noticeBody} />
      ) : null}
      {error ? (
        <p className="m-0 text-[12px] font-semibold text-[var(--dl-color-text-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={busy}>
          {busy ? "만드는 중..." : submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
