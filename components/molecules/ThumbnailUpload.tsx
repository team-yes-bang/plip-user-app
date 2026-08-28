"use client";

import { AGIT_THUMBNAIL_ACCEPT } from "@/lib/agit/thumbnailImage";
import { prepareAgitThumbnailFile } from "@/lib/agit/prepareAgitThumbnail";
import { toast } from "@/components/ui/toast";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

type ThumbnailUploadProps = {
  previewSrc?: string;
  onFileSelect?: (file: File | null) => void;
  disabled?: boolean;
};

export function ThumbnailUpload({
  previewSrc,
  onFileSelect,
  disabled,
}: ThumbnailUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | undefined>();
  const [preparing, setPreparing] = useState(false);
  const displayPreview = pickedPreview ?? previewSrc;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function openFilePicker() {
    if (disabled || preparing) return;
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPreparing(true);
    try {
      const prepared = await prepareAgitThumbnailFile(file);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const nextUrl = URL.createObjectURL(prepared);
      previewUrlRef.current = nextUrl;
      setPickedPreview(nextUrl);
      onFileSelect?.(prepared);
    } catch (error) {
      onFileSelect?.(null);
      toast.add({
        type: "error",
        title: "썸네일 선택 실패",
        description: error instanceof Error ? error.message : "이미지를 불러오지 못했습니다.",
      });
    } finally {
      setPreparing(false);
    }
  }

  if (displayPreview) {
    return (
      <div className="relative overflow-hidden rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] m-dlUploadHero">
        <img
          src={displayPreview}
          alt=""
          className="aspect-video w-full object-cover"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={AGIT_THUMBNAIL_ACCEPT}
          className="sr-only"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={disabled || preparing}
          onClick={openFilePicker}
          className="absolute bottom-[12px] right-[12px] rounded-[999px] border-0 bg-[rgba(0,0,0,0.55)] px-[14px] py-[8px] text-[12px] font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {preparing ? "처리 중..." : "썸네일 변경"}
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={AGIT_THUMBNAIL_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={disabled || preparing}
        className="flex w-full items-center gap-[12px] border border-[var(--dl-color-border-default)] rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[14px_16px] text-left flex min-h-[126px] flex-col items-center justify-center gap-[6px] border-0 rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] p-[24px_16px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed m-dlUploadHero"
        onClick={openFilePicker}
      >
        <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-brand)]">
          {preparing ? "처리 중..." : "썸네일 추가"}
        </p>
        <p className="m-0 text-[11px] text-[var(--dl-color-text-tertiary)]">권장 16:9 · JPG, PNG</p>
      </button>
    </>
  );
}
