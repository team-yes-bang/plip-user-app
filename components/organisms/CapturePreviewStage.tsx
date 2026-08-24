"use client";

import { DailyIcon, Input, Label, SubmitButton } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { HeaderBackButton, ScreenHeader } from "@/components/molecules";
import { CAPTION_MAX_LENGTH } from "@/lib/video/constants";

type CapturePreviewStageProps = {
  caption: string;
  uploading: boolean;
  originalView: boolean;
  onCaptionChange: (value: string) => void;
  onBack: () => void;
  onViewOriginal: () => void;
  onCloseOriginal: () => void;
  onContinue: () => void;
};

export function CapturePreviewStage({
  caption,
  uploading,
  originalView,
  onCaptionChange,
  onBack,
  onViewOriginal,
  onCloseOriginal,
  onContinue,
}: CapturePreviewStageProps) {
  if (originalView) {
    return (
      <button
        type="button"
        className="absolute top-3 left-[15px] z-40 grid h-11 w-11 place-items-center rounded-full border-0 bg-[var(--dl-color-bg-surface)]"
        aria-label="원본 크기 닫기"
        onClick={onCloseOriginal}
      >
        <DailyIcon name="x" size={20} />
      </button>
    );
  }

  return (
    <>
      <div className="order-1 shrink-0 px-[23px] pt-3">
        <ScreenHeader
          tone="plain"
          leading={<HeaderBackButton onClick={onBack} label="다시 촬영" />}
          title="영상 확인"
        />
      </div>
      <div className="order-3 flex shrink-0 flex-col gap-3 px-[23px] pt-3 pb-8">
        <div className={ui.field}>
          <Label htmlFor="capture-caption" className={ui.fieldLabel}>
            캡션
          </Label>
          <Input
            id="capture-caption"
            name="caption"
            value={caption}
            maxLength={CAPTION_MAX_LENGTH}
            placeholder="영상에 올릴 문구"
            variant="daily"
            onChange={(event) => onCaptionChange(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <SubmitButton type="button" variant="brandOutline" className="flex-1" onClick={onViewOriginal}>
            원본 크기 보기
          </SubmitButton>
          <SubmitButton type="button" variant="brand" className="flex-1" disabled={uploading} onClick={onContinue}>
            업로드 설정
          </SubmitButton>
        </div>
      </div>
    </>
  );
}
