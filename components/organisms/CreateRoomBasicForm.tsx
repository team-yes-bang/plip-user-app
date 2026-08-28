"use client";

import { SubmitButton } from "@/components/atoms";
import { AuthField, CapacityStepper } from "@/components/molecules";
import { ThumbnailUpload } from "@/components/molecules/ThumbnailUpload";
import { CREATE_ROOM_DRAFT_KEY, readCreateRoomDraft } from "@/lib/agit/createRoomDraft";
import { resolveAgitThumbnailUrl } from "@/lib/agit/thumbnailImage";
import { uploadAgitThumbnailFile } from "@/lib/agit/uploadThumbnail";
import { ROUTES } from "@/config/routes";
import {
  AGIT_DEFAULT_MAX_CAPACITY,
  AGIT_DESCRIPTION_MAX_LENGTH,
  AGIT_NAME_MAX_LENGTH,
} from "@/types/agit/schema";
import type { UiCreateAgitDraft } from "@/types/agit/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateRoomBasicForm() {
  const router = useRouter();
  const [capacity, setCapacity] = useState(AGIT_DEFAULT_MAX_CAPACITY);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [savedThumbnailPath] = useState<string | undefined>(() => {
    const draft = readCreateRoomDraft();
    return draft?.thumbnailPath;
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = savedThumbnailPath ? resolveAgitThumbnailUrl(savedThumbnailPath) : undefined;

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setPending(true);

    let thumbnailPath = savedThumbnailPath;
    if (thumbnailFile) {
      try {
        thumbnailPath = await uploadAgitThumbnailFile(thumbnailFile);
      } catch (uploadError) {
        setPending(false);
        setError(uploadError instanceof Error ? uploadError.message : "썸네일 업로드에 실패했습니다.");
        return;
      }
    }

    const draft: UiCreateAgitDraft = {
      title: String(formData.get("title") ?? ""),
      intro: String(formData.get("intro") ?? ""),
      capacity,
      ...(thumbnailPath ? { thumbnailPath } : {}),
    };
    sessionStorage.setItem(CREATE_ROOM_DRAFT_KEY, JSON.stringify(draft));
    setPending(false);
    router.push(ROUTES.agit.createSettings);
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <ThumbnailUpload
        previewSrc={previewSrc}
        onFileSelect={setThumbnailFile}
        disabled={pending}
      />

      <AuthField
        id="room-title"
        name="title"
        label="아지트 제목"
        hint={`최대 ${AGIT_NAME_MAX_LENGTH}자`}
        placeholder="새벽 기상 인증"
        maxLength={AGIT_NAME_MAX_LENGTH}
        required
      />
      <AuthField
        id="room-intro"
        name="intro"
        label="소개글"
        hint={`최대 ${AGIT_DESCRIPTION_MAX_LENGTH}자`}
        placeholder="함께 아침 루틴을 기록해요"
        maxLength={AGIT_DESCRIPTION_MAX_LENGTH}
      />

      <p className="m-0 text-[14px] font-medium text-[var(--dl-color-text-primary)]">최대 인원</p>
      <div className="flex items-center justify-between gap-[12px] min-h-[68px] p-[13px_14px] rounded-[12px] bg-[var(--dl-color-bg-brand-subtle)]">
        <div className="dl-capacity-card__body">
          <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">{capacity}명</p>
          <p className="m-[4px_0_0] text-[11px] text-[var(--dl-color-text-secondary)]">기본 {AGIT_DEFAULT_MAX_CAPACITY}명</p>
        </div>
        <CapacityStepper
          value={capacity}
          min={2}
          max={AGIT_DEFAULT_MAX_CAPACITY}
          onChange={setCapacity}
          compact
        />
      </div>
      <p className="m-0 text-[11px] text-[var(--dl-color-text-tertiary)]">
        기본 정원 {AGIT_DEFAULT_MAX_CAPACITY}명까지 설정할 수 있어요.
      </p>

      {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

      <div className="flex w-full flex-col gap-[14px] mt-auto">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "업로드 중..." : "다음"}
        </SubmitButton>
      </div>
    </form>
  );
}
