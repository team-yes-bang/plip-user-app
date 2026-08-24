"use client";

import { requestEmailOtpAction, verifyEmailOtpAction } from "@/actions/authActions";
import { Input, Label, SubmitButton, TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import { AuthField, AuthTopBar } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { OTP_CODE_TTL_MINUTES } from "@/lib/auth/otp-policy";
import { savePasswordResetDraft } from "@/lib/auth/password-reset-draft";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ForgotPasswordStep = 1 | 2;

function resolveOtpVerifyError(message: string): string {
  if (message.includes("OTP_EXPIRED_OR_NOT_FOUND") || message.includes("OTP_MISMATCH")) {
    return "인증번호가 올바르지 않거나 만료되었습니다. 이메일 로그인으로 가입한 계정인지 확인해 주세요.";
  }
  return message;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpReadOnly, setOtpReadOnly] = useState(true);
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") ?? "").trim();
    if (!nextEmail) {
      toast.add({ type: "error", title: "이메일을 입력해 주세요." });
      return;
    }

    setPending(true);
    const result = await requestEmailOtpAction(nextEmail, "PASSWORD_RESET");
    setPending(false);

    if (!result.ok) {
      toast.add({ type: "error", title: "인증번호 발송 실패", description: result.error });
      return;
    }

    setEmail(nextEmail);
    setOtp("");
    setOtpReadOnly(true);
    setStep(2);
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const otpCode = otp.trim();
    if (!/^\d{6}$/.test(otpCode)) {
      toast.add({ type: "error", title: "인증번호 6자리를 입력해 주세요." });
      return;
    }

    setPending(true);
    const result = await verifyEmailOtpAction(email, otpCode, "PASSWORD_RESET");
    setPending(false);

    if (!result.ok) {
      toast.add({
        type: "error",
        title: "인증 실패",
        description: resolveOtpVerifyError(result.error),
      });
      return;
    }

    savePasswordResetDraft({
      email,
      verificationToken: result.data.verificationToken,
    });
    router.push(ROUTES.resetPassword);
  }

  async function handleResendOtp() {
    setPending(true);
    const result = await requestEmailOtpAction(email, "PASSWORD_RESET");
    setPending(false);

    if (!result.ok) {
      toast.add({ type: "error", title: "인증번호 재발송 실패", description: result.error });
      return;
    }

    toast.add({ type: "success", title: "인증번호를 다시 보냈습니다" });
  }

  if (step === 2) {
    return (
      <form className="flex w-full flex-col gap-4" onSubmit={handleOtpSubmit} autoComplete="off">
        <AuthTopBar title="비밀번호 찾기" onBack={() => {
          setOtp("");
          setOtpReadOnly(true);
          setStep(1);
        }} />
        <p className={ui.subtitle}>
          {email}으로 보낸 6자리 인증번호를 입력하세요.
          <br />
          인증번호는 {OTP_CODE_TTL_MINUTES}분 동안 유효합니다.
        </p>
        <div className={ui.field}>
          <Label htmlFor="forgot-password-otp" className={ui.fieldLabel}>
            인증번호
          </Label>
          <Input
            id="forgot-password-otp"
            name="verification-code"
            type="text"
            placeholder="6자리 입력"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            readOnly={otpReadOnly}
            onFocus={() => setOtpReadOnly(false)}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            variant="daily"
          />
        </div>
        <button
          type="button"
          className={cn(ui.link, "cursor-pointer self-end text-[12px] disabled:cursor-not-allowed disabled:opacity-50")}
          disabled={pending}
          onClick={() => void handleResendOtp()}
        >
          인증번호 다시 보내기
        </button>
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "인증 확인 중..." : "인증 완료"}
        </SubmitButton>
        <p className="text-center text-[13px] leading-5 text-[var(--dl-color-text-secondary)]">
          메일이 오지 않았나요? 스팸함을 확인해 주세요.
          <br />
          이메일 로그인으로 가입하지 않았거나 소셜 로그인만 사용한 경우 인증번호가 발송되지 않습니다.
        </p>
      </form>
    );
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleEmailSubmit}>
      <AuthTopBar title="비밀번호 찾기" backHref={ROUTES.login} />
      <p className={ui.subtitle}>
        이메일 로그인으로 가입한 계정에만 인증번호를 보내드립니다.
      </p>
      <AuthField
        id="forgot-password-email"
        name="email"
        type="email"
        label="이메일"
        placeholder="name@example.com"
        autoComplete="email"
        required
      />
      <SubmitButton variant="brand" disabled={pending}>
        {pending ? "인증번호 발송 중..." : "인증번호 받기"}
      </SubmitButton>
      <p className="text-center text-[13px] font-medium text-[var(--dl-color-text-brand)]">
        이메일이 기억났나요?{" "}
        <TextLink href={ROUTES.login} className={cn(ui.link, "text-[13px]")}>
          로그인
        </TextLink>
      </p>
    </form>
  );
}
