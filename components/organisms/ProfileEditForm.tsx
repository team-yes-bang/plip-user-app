"use client";

import { updateMyProfileAction } from "@/actions/userActions";
import { DailyIcon, SubmitButton } from "@/components/atoms";
import { AuthField } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import { ROUTES } from "@/config/routes";
import {
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH,
  type UiUserProfile,
} from "@/types/user/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileEditFormProps = {
  profile: UiUserProfile;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    setPending(true);

    const result = await updateMyProfileAction(formData.get("nickname"));
    setPending(false);

    if (!(await handleClientActionResult(result, router, { errorTitle: "프로필 저장 실패" }))) {
      return;
    }

    toast.add({ type: "success", title: "프로필을 저장했습니다" });
    router.push(ROUTES.mypage.root);
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" action={handleSubmit}>
      <div className="flex min-h-[84px] w-full items-center gap-[12px] rounded-[14px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-[14px]">
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[999px]">
          <Image
            src={profile.profileImageUrl}
            alt=""
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold leading-[18px] text-[var(--dl-color-text-primary)]">
            프로필 사진
          </p>
          <p className="m-0 text-[13px] leading-[16px] text-[var(--dl-color-text-secondary)]">
            이미지 업로드는 준비 중입니다
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-[44px] cursor-pointer items-center gap-[8px] border-0 bg-[transparent] p-[12px_0] text-sm font-medium leading-5 text-[var(--dl-color-text-brand)]"
        >
          <DailyIcon name="camera" size={20} />
          사진 변경
        </button>
      </div>

      <AuthField
        id="profile-nickname"
        name="nickname"
        label="닉네임"
        hint={`${USER_NICKNAME_MIN_LENGTH}~${USER_NICKNAME_MAX_LENGTH}자`}
        defaultValue={profile.nickname}
        maxLength={USER_NICKNAME_MAX_LENGTH}
        required
      />

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px]">
        <p className="m-0 text-[13px] font-semibold leading-[19px] text-[var(--dl-color-text-primary)]">
          기존 방에는 자동 반영되지 않아요
        </p>
        <p className="m-0 mt-1.5 text-xs font-normal leading-[18px] text-[var(--dl-color-text-secondary)]">
          이미 방 전용 프로필을 사용 중인 방은 해당 프로필을 유지합니다.
        </p>
      </div>

      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "저장 중..." : "변경사항 저장"}
        </SubmitButton>
      </div>
    </form>
  );
}
