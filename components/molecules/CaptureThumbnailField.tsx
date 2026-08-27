"use client";

import { SubmitButton } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { useRef } from "react";

type CaptureThumbnailFieldProps = {
  previewUrl: string | null;
  source: "file" | "frame" | null;
  error: string | null;
  disabled?: boolean;
  required?: boolean;
  onPickFile: (file: File) => void;
  onCaptureFrame: () => void;
};

export function CaptureThumbnailField({
  previewUrl,
  source,
  error,
  disabled = false,
  required = true,
  onPickFile,
  onCaptureFrame,
}: CaptureThumbnailFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceLabel = source === "file" ? "이미지 파일" : source === "frame" ? "영상 장면" : null;

  return (
    <div className={ui.field}>
      <p className={ui.fieldLabel}>
        썸네일{required ? <span className="text-[var(--dl-color-text-danger)]"> *</span> : null}
      </p>
      <div className="flex items-start gap-3">
        <div
          className="relative h-[128px] w-[72px] shrink-0 overflow-hidden rounded-[12px] bg-[var(--dl-color-bg-brand-subtle)]"
          aria-hidden={!previewUrl}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] leading-4 text-[var(--dl-color-text-tertiary)]">
              미등록
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="m-0 text-[12px] leading-4 text-[var(--dl-color-text-secondary)]">
            {sourceLabel
              ? `${sourceLabel}으로 등록됐어요.`
              : "이미지를 고르거나, 재생 중인 장면을 담아 주세요."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SubmitButton
              type="button"
              variant="brandOutline"
              className="min-h-10 flex-1"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              이미지 선택
            </SubmitButton>
            <SubmitButton
              type="button"
              variant="brandOutline"
              className="min-h-10 flex-1"
              disabled={disabled}
              onClick={onCaptureFrame}
            >
              현재 장면 담기
            </SubmitButton>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onPickFile(file);
          }
        }}
      />
      {error ? (
        <p className="m-0 text-[12px] font-semibold text-[var(--dl-color-text-danger)]" role="alert">
          {error}
        </p>
      ) : required && !previewUrl ? (
        <p className="m-0 text-[12px] text-[var(--dl-color-text-tertiary)]">업로드하려면 썸네일이 필요해요.</p>
      ) : null}
    </div>
  );
}
