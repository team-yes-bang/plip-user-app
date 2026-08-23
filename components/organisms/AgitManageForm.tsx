"use client";

import { reissueInviteCodeAction, updateAgitAction } from "@/actions/agitActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField, CapacityStepper } from "@/components/molecules";
import { ThumbnailUpload } from "@/components/molecules/ThumbnailUpload";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { copyText } from "@/lib/copyText";
import { Check, Copy, Link2 } from "lucide-react";
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
  const [inviteCode, setInviteCode] = useState(agit.inviteCode?.trim() ?? "");
  const [copied, setCopied] = useState(false);
  const [reissuing, setReissuing] = useState(false);

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

  async function copyInviteCode() {
    if (!inviteCode) return;
    const ok = await copyText(inviteCode);
    setCopied(ok);
    if (ok) {
      toast.add({ type: "success", title: "초대코드를 복사했습니다" });
    }
  }

  async function reissueInviteCode() {
    if (reissuing) return;
    setReissuing(true);
    const result = await reissueInviteCodeAction(agit.id);
    setReissuing(false);
    if (!result.ok) {
      toast.add({ type: "error", title: "초대코드를 재설정하지 못했습니다", description: result.error });
      return;
    }
    setInviteCode(result.data);
    setCopied(false);
    toast.add({ type: "success", title: "초대코드를 재설정했습니다" });
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

      <p className="m-0 text-[14px] font-medium text-[var(--dl-color-text-primary)]">초대코드</p>
      <button
        type="button"
        className="flex min-h-[32px] w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#e3e0ed] bg-[#fff] p-[6px_10px] text-left disabled:cursor-default"
        onClick={copyInviteCode}
        disabled={!inviteCode}
        aria-label="초대코드 복사"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Link2 className="size-3.5 shrink-0 text-[#262433]" strokeWidth={2} />
          <p className="m-0 overflow-hidden text-xs font-medium tracking-[0.04em] text-[#262433] whitespace-nowrap [text-overflow:ellipsis]">
            {inviteCode || "초대코드"}
          </p>
        </div>
        {copied ? (
          <Check className="size-3.5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2} aria-hidden />
        ) : (
          <Copy className="size-3.5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2} aria-hidden />
        )}
        <span className="sr-only">{copied ? "복사됨" : "복사"}</span>
      </button>
      <SubmitButton type="button" variant="outline" disabled={reissuing} onClick={reissueInviteCode}>
        {reissuing ? "재설정 중..." : "초대코드 재설정"}
      </SubmitButton>

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
