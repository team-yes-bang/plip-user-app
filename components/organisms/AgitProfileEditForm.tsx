"use client";

import { updateMyAgitProfileAction } from "@/actions/agitActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { AGIT_NICKNAME_MAX_LENGTH, AGIT_NICKNAME_MIN_LENGTH } from "@/types/agit/schema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AgitProfileEditFormProps = {
  agitId: string;
  nickname: string;
};

export function AgitProfileEditForm({ agitId, nickname }: AgitProfileEditFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setPending(true);

    const result = await updateMyAgitProfileAction(agitId, formData.get("nickname"));
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.add({ type: "success", title: "프로필을 저장했습니다" });
    router.push(ROUTES.agit.detail(agitId));
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <p className="m-0 text-[16px] font-semibold text-[var(--dl-color-text-primary)]">사진과 닉네임</p>

      <div className="flex min-h-[84px] w-full items-center gap-[12px] rounded-[14px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-[14px] text-left">
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[999px]">
          <Image src="/plip/v13/profile-avatar.svg" alt="" width={56} height={56} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold leading-[18px] text-[var(--dl-color-text-primary)]">프로필 사진</p>
          <p className="m-0 text-[13px] leading-[16px] text-[var(--dl-color-text-secondary)]">아지트에서 사용할 프로필</p>
        </div>
        <button
          type="button"
          className="cursor-pointer whitespace-nowrap border-0 bg-[transparent] text-xs font-medium text-[var(--dl-color-text-brand)]"
        >
          사진 변경
        </button>
      </div>

      <AuthField
        id="profile-nickname"
        name="nickname"
        label="닉네임"
        hint={`영문·숫자·한글 ${AGIT_NICKNAME_MIN_LENGTH}~${AGIT_NICKNAME_MAX_LENGTH}자`}
        placeholder="닉네임"
        defaultValue={nickname}
        maxLength={AGIT_NICKNAME_MAX_LENGTH}
        pattern="[0-9A-Za-z가-힣]{2,12}"
        title="영문·숫자·한글 2~12자, 특수문자와 공백 불가"
        required
      />

      {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </SubmitButton>
      </div>
    </form>
  );
}
