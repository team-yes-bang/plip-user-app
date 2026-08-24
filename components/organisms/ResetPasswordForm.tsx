"use client";

import { resetPasswordAction } from "@/actions/authActions";
import { SubmitButton, TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import { AuthField, AuthTopBar } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { OTP_VERIFICATION_TOKEN_TTL_MINUTES } from "@/lib/auth/otp-policy";
import {
  clearPasswordResetDraft,
  readPasswordResetDraft,
} from "@/lib/auth/password-reset-draft";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!readPasswordResetDraft()) {
      router.replace(ROUTES.forgotPassword);
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const draft = readPasswordResetDraft();
    if (!draft) {
      router.replace(ROUTES.forgotPassword);
      return;
    }

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");

    if (password.length < 8) {
      toast.add({ type: "error", title: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (password !== passwordConfirm) {
      toast.add({ type: "error", title: "비밀번호가 일치하지 않습니다." });
      return;
    }

    setPending(true);
    const result = await resetPasswordAction({
      email: draft.email,
      verificationToken: draft.verificationToken,
      newPassword: password,
    });
    setPending(false);

    if (!result.ok) {
      toast.add({ type: "error", title: "비밀번호 변경 실패", description: result.error });
      return;
    }

    clearPasswordResetDraft();
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex w-full flex-col gap-4">
        <AuthTopBar title="비밀번호 변경 완료" backHref={ROUTES.login} />
        <p className={ui.subtitle}>새 비밀번호가 안전하게 저장되었습니다.</p>
        <TextLink href={ROUTES.login} className={cn(ui.btn, ui.btnPrimary, "!no-underline")}>
          로그인하기
        </TextLink>
        <p className="text-center text-[13px] text-[var(--dl-color-text-secondary)]">
          보안을 위해 모든 기기에서 다시 로그인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <AuthTopBar title="새 비밀번호 설정" backHref={ROUTES.forgotPassword} />
      <p className={ui.subtitle}>
        이전에 사용하지 않은 비밀번호를 입력해 주세요.
        <br />
        인증은 {OTP_VERIFICATION_TOKEN_TTL_MINUTES}분 동안 유효합니다.
      </p>
      <AuthField
        id="reset-password"
        name="password"
        type="password"
        label="새 비밀번호"
        placeholder="8자 이상 입력"
        autoComplete="new-password"
        required
      />
      <AuthField
        id="reset-password-confirm"
        name="passwordConfirm"
        type="password"
        label="새 비밀번호 확인"
        placeholder="한 번 더 입력"
        autoComplete="new-password"
        required
      />
      <p className="m-0 text-[12px] text-[var(--dl-color-text-secondary)]">
        영문·숫자를 포함해 8자 이상 입력해 주세요.
      </p>
      <SubmitButton variant="brand" disabled={pending}>
        {pending ? "변경 중..." : "비밀번호 변경"}
      </SubmitButton>
    </form>
  );
}
