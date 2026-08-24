"use client";

import { updateMyProfileAction } from "@/actions/userActions";
import { SubmitButton } from "@/components/atoms";
import { ActionSheet, AuthField } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import {
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH,
  type UiUserProfile,
} from "@/types/user/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileEditSheetProps = {
  open: boolean;
  profile: UiUserProfile;
  onClose: () => void;
};

export function ProfileEditSheet({ open, profile, onClose }: ProfileEditSheetProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await updateMyProfileAction(formData.get("nickname"));
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.add({ type: "success", title: "프로필을 저장했습니다" });
    onClose();
    router.refresh();
  }

  return (
    <ActionSheet open={open} title="프로필 수정" onClose={onClose}>
      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
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

        {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </SubmitButton>
      </form>
    </ActionSheet>
  );
}
