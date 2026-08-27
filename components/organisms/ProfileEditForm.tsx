"use client";

import { updateMyProfileAction } from "@/actions/userActions";
import { DailyIcon, Input, Label, SubmitButton } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import { ROUTES } from "@/config/routes";
import { prepareProfileImageFile } from "@/lib/user/prepareProfileImage";
import {
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_MAX_MB,
} from "@/lib/user/profileImage";
import {
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH,
  type UiUserProfile,
} from "@/types/user/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

type ProfileEditFormProps = {
  profile: UiUserProfile;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [nickname, setNickname] = useState(profile.nickname);
  const [previewSrc, setPreviewSrc] = useState(profile.profileImageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function openFilePicker() {
    if (pending) return;
    fileInputRef.current?.click();
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const prepared = await prepareProfileImageFile(file);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const nextUrl = URL.createObjectURL(prepared);
      previewUrlRef.current = nextUrl;
      setPreviewSrc(nextUrl);
      setImageFile(prepared);
    } catch (error) {
      toast.add({
        type: "error",
        title: "프로필 사진 선택 실패",
        description: error instanceof Error ? error.message : "이미지를 불러오지 못했습니다.",
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);

    const formData = new FormData();
    formData.set("nickname", nickname);
    if (imageFile) {
      formData.set("profileImage", imageFile);
    }

    const result = await updateMyProfileAction(formData);
    setPending(false);

    if (!(await handleClientActionResult(result, router, { errorTitle: "프로필 저장 실패" }))) {
      return;
    }

    toast.add({ type: "success", title: "프로필을 저장했습니다" });
    router.push(ROUTES.mypage.root);
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" onSubmit={handleSubmit}>
      <div className="flex min-h-[84px] w-full items-center gap-[12px] rounded-[14px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-[14px]">
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[999px]">
          <img
            src={previewSrc}
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
            JPG, PNG, WEBP · 최대 {PROFILE_IMAGE_MAX_MB}MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          className="sr-only"
          onChange={handleImageChange}
        />
        <button
          type="button"
          disabled={pending}
          onClick={openFilePicker}
          className="inline-flex h-[44px] cursor-pointer items-center gap-[8px] border-0 bg-[transparent] p-[12px_0] text-sm font-medium leading-5 text-[var(--dl-color-text-brand)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DailyIcon name="camera" size={20} />
          사진 변경
        </button>
      </div>

      <div className={ui.field}>
        <Label htmlFor="profile-nickname" className={ui.fieldLabel}>
          닉네임
        </Label>
        <Input
          id="profile-nickname"
          name="nickname"
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={USER_NICKNAME_MAX_LENGTH}
          required
          variant="daily"
        />
        <p className={ui.hint}>{`${USER_NICKNAME_MIN_LENGTH}~${USER_NICKNAME_MAX_LENGTH}자`}</p>
      </div>

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
