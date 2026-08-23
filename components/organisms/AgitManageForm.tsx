"use client";

import { updateAgitAction } from "@/actions/agitActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField, CapacityStepper } from "@/components/molecules";
import { ThumbnailUpload } from "@/components/molecules/ThumbnailUpload";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import {
  AGIT_DEFAULT_MAX_CAPACITY,
  AGIT_DESCRIPTION_MAX_LENGTH,
  AGIT_NAME_MAX_LENGTH,
} from "@/types/agit/schema";
import type { UiAgit } from "@/types/agit/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AgitManageFormProps = {
  agit: UiAgit;
};

export function AgitManageForm({ agit }: AgitManageFormProps) {
  const router = useRouter();
  const minCapacity = Math.max(agit.memberCount, 1);
  const [capacity, setCapacity] = useState(
    Math.max(agit.maxMembers ?? minCapacity, minCapacity),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setPending(true);

    const result = await updateAgitAction(
      agit.id,
      {
        agitName: formData.get("title"),
        description: formData.get("intro"),
        maximumCapacity: capacity,
      },
      minCapacity,
    );

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.add({ type: "success", title: "아지트 정보를 저장했습니다" });
    router.push(ROUTES.agit.detail(agit.id));
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <ThumbnailUpload />

      <AuthField
        id="manage-title"
        name="title"
        label="아지트 제목"
        hint={`최대 ${AGIT_NAME_MAX_LENGTH}자`}
        placeholder="새벽 기상 인증"
        defaultValue={agit.name}
        maxLength={AGIT_NAME_MAX_LENGTH}
        required
      />
      <AuthField
        id="manage-intro"
        name="intro"
        label="소개글"
        hint={`최대 ${AGIT_DESCRIPTION_MAX_LENGTH}자`}
        placeholder="함께 아침 루틴을 기록해요"
        defaultValue={agit.description}
        maxLength={AGIT_DESCRIPTION_MAX_LENGTH}
      />

      <p className="m-0 text-[14px] font-medium text-[var(--dl-color-text-primary)]">최대 인원</p>
      <div className="flex min-h-[68px] items-center justify-between gap-[12px] rounded-[12px] bg-[var(--dl-color-bg-brand-subtle)] p-[13px_14px]">
        <div>
          <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">{capacity}명</p>
          <p className="m-[4px_0_0] text-[11px] text-[var(--dl-color-text-secondary)]">
            현재 인원 {agit.memberCount}명 · 최대 {AGIT_DEFAULT_MAX_CAPACITY}명
          </p>
        </div>
        <CapacityStepper
          value={capacity}
          min={minCapacity}
          max={AGIT_DEFAULT_MAX_CAPACITY}
          onChange={setCapacity}
          compact
        />
      </div>
      <p className="m-0 text-[11px] text-[var(--dl-color-text-tertiary)]">
        정원은 현재 멤버 수보다 작게 줄일 수 없어요.
      </p>

      {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </SubmitButton>
      </div>
    </form>
  );
}
