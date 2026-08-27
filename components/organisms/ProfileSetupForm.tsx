"use client";

import { signupLocalAction } from "@/actions/authActions";
import { SubmitButton } from "@/components/atoms";
import { AuthField } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import { clearSignupDraft, readSignupDraft } from "@/lib/auth/signup-draft";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileSetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const draft = readSignupDraft();
    if (!draft) {
      setError("이메일 인증 정보가 없습니다. 회원가입을 다시 진행해 주세요.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const nickname = String(form.get("nickname") ?? "").trim();
    if (nickname.length < 2 || nickname.length > 12) {
      setError("닉네임은 2자 이상 12자 이하로 입력해 주세요.");
      return;
    }

    setPending(true);
    const result = await signupLocalAction({
      email: draft.email,
      password: draft.password,
      verificationToken: draft.verificationToken,
      nickname,
      termsAgreements: draft.termsAgreements,
    });

    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: draft.email,
      password: draft.password,
      redirect: false,
    });
    clearSignupDraft();
    setPending(false);

    if (signInResult?.error) {
      router.push(ROUTES.login);
      router.refresh();
      return;
    }

    router.push(ROUTES.intro);
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <button type="button" className="relative w-[92px] h-[92px] overflow-hidden rounded-[46px] [&_img:first-child]:w-full [&_img:first-child]:h-full [&_img:first-child]:object-cover" aria-label="프로필 사진 등록">
        <img src="/plip/v13/profile-avatar.svg" alt="" width={96} height={96} />
        <img
          src="/plip/daily-loop/icon-camera.svg"
          alt=""
          width={24}
          height={24}
          className="absolute top-[32px] left-[32px] w-[28px] h-[28px]"
        />
      </button>
      <AuthField
        id="profile-nickname"
        name="nickname"
        label="닉네임"
        placeholder="안지민"
        autoComplete="nickname"
        required
      />
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "가입 중..." : "설정"}
        </SubmitButton>
      </div>
    </form>
  );
}
