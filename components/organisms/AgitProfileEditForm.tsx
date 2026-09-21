"use client";

import { updateMyAgitProfileAction } from "@/actions/agitActions";
import { SubmitButton, UserAvatar } from "@/components/atoms";
import { AuthField } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import { ROUTES } from "@/config/routes";
import { prepareProfileImageFile } from "@/lib/user/prepareProfileImage";
import { PROFILE_IMAGE_ACCEPT, PROFILE_IMAGE_MAX_MB } from "@/lib/user/profileImage";
import { AGIT_NICKNAME_MAX_LENGTH, AGIT_NICKNAME_MIN_LENGTH } from "@/types/agit/schema";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

type AgitProfileEditFormProps = {
  agitId: string;
  nickname: string;
  profileImageUrl: string;
};

export function AgitProfileEditForm({ agitId, nickname, profileImageUrl }: AgitProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [nicknameValue, setNicknameValue] = useState(nickname);
  const [previewSrc, setPreviewSrc] = useState(profileImageUrl);
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
    formData.set("nickname", nicknameValue);
    if (imageFile) {
      formData.set("profileImage", imageFile);
    }

    const result = await updateMyAgitProfileAction(agitId, formData);
    setPending(false);

    if (!(await handleClientActionResult(result, router, { errorTitle: "프로필 저장 실패" }))) {
      return;
    }

    toast.add({ type: "success", title: "프로필을 저장했습니다" });
    router.push(ROUTES.agit.detail(agitId));
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" onSubmit={handleSubmit}>
      <p className="m-0 text-[16px] font-semibold text-[var(--dl-color-text-primary)]">사진과 닉네임</p>

      <div className="flex min-h-[84px] w-full items-center gap-[12px] rounded-[14px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-[14px] text-left">
        <UserAvatar src={previewSrc} size={56} className="border-0" />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold leading-[18px] text-[var(--dl-color-text-primary)]">프로필 사진</p>
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
          className="cursor-pointer whitespace-nowrap border-0 bg-[transparent] text-xs font-medium text-[var(--dl-color-text-brand)] disabled:cursor-not-allowed disabled:opacity-50"
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
        value={nicknameValue}
        onChange={(event) => setNicknameValue(event.target.value)}
        maxLength={AGIT_NICKNAME_MAX_LENGTH}
        pattern="[0-9A-Za-z가-힣]{2,12}"
        title="영문·숫자·한글 2~12자, 특수문자와 공백 불가"
        required
      />

      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </SubmitButton>
      </div>
    </form>
  );
}
