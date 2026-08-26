"use client";

import { Input, Label, SubmitButton } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { HeaderBackButton, PageContainer, ScreenHeader } from "@/components/molecules";
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
      <div className="absolute inset-x-0 top-0 z-40">
        <ScreenHeader
          tone="overlay"
          leading={<HeaderBackButton onClick={onCloseOriginal} label="원본 크기 닫기" />}
        />
      </div>
    );
  }

  return (
    <>
      <div className="order-1 shrink-0">
        <ScreenHeader
          leading={<HeaderBackButton onClick={onBack} label="다시 촬영" />}
          title="영상 확인"
        />
      </div>
      <PageContainer
        as="div"
        gap="tight"
        aria-label="영상 확인"
        className="order-3 flex-none overflow-visible"
      >
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
      </PageContainer>
    </>
  );
}
