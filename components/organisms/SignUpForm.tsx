"use client";

import {
  completeSocialSignupAction,
  listActiveTermsAction,
  requestEmailOtpAction,
  verifyEmailOtpAction,
} from "@/actions/authActions";
import { Input, Label, SubmitButton, TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import { AgreementRow, AuthField, AuthTopBar, PasswordInput } from "@/components/molecules";
import { RestoreAccountDialog } from "@/components/organisms/RestoreAccountDialog";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { AUTH_ERROR_CODES, formatActionErrorMessage, parseActionErrorCode } from "@/lib/auth/auth-errors";
import { isSocialProvider } from "@/lib/auth/social-providers";
import { saveSignupDraft } from "@/lib/auth/signup-draft";
import type { UiRestorePayload, UiTerm } from "@/types/auth/ui";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SignUpStep = 1 | 2 | 3;

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSocialMode = searchParams.get("mode") === "social";
  const socialProvider = searchParams.get("provider");
  const isSocialSignup = isSocialMode && isSocialProvider(socialProvider);
  const [step, setStep] = useState<SignUpStep>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpReadOnly, setOtpReadOnly] = useState(true);
  const [verificationToken, setVerificationToken] = useState("");
  const [terms, setTerms] = useState<UiTerm[]>([]);
  const [agreements, setAgreements] = useState<Record<number, boolean>>({});
  const [termsLoading, setTermsLoading] = useState(isSocialSignup);
  const [pending, setPending] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restorePayload, setRestorePayload] = useState<UiRestorePayload | null>(null);

  const requiredTerms = terms.filter((term) => term.required);
  const optionalTerms = terms.filter((term) => !term.required);
  const agreeAll = terms.length > 0 && terms.every((term) => agreements[term.id]);
  const allRequiredAgreed = requiredTerms.every((term) => agreements[term.id] === true);

  const activeStep: SignUpStep = isSocialSignup ? 3 : step;

  useEffect(() => {
    if (isSocialMode && !isSocialProvider(socialProvider)) {
      router.replace(ROUTES.login);
    }
  }, [isSocialMode, socialProvider, router]);

  useEffect(() => {
    if (activeStep !== 3) {
      return;
    }

    let cancelled = false;

    void listActiveTermsAction().then((result) => {
      if (cancelled) {
        return;
      }

      setTermsLoading(false);

      if (!result.ok) {
        setTerms([]);
        toast.add({ type: "error", title: "약관 조회 실패", description: result.error });
        return;
      }

      setTerms(result.data);
      setAgreements(Object.fromEntries(result.data.map((term) => [term.id, false])));
    });

    return () => {
      cancelled = true;
    };
  }, [activeStep, isSocialSignup]);

  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") ?? "").trim();
    const nextPassword = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");

    if (!nextEmail) {
      toast.add({ type: "error", title: "이메일을 입력해 주세요." });
      return;
    }
    if (nextPassword.length < 8) {
      toast.add({ type: "error", title: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (nextPassword !== passwordConfirm) {
      toast.add({ type: "error", title: "비밀번호가 일치하지 않습니다." });
      return;
    }

    setPending(true);
    const result = await requestEmailOtpAction(nextEmail, "SIGNUP");
    setPending(false);

    if (!result.ok) {
      const errorCode = parseActionErrorCode(result.error);
      if (errorCode === AUTH_ERROR_CODES.PENDING_RESTORE) {
        setRestorePayload({ type: "local", email: nextEmail, password: nextPassword });
        setRestoreOpen(true);
        return;
      }

      const title =
        errorCode === "SIGNUP_002" ? "이미 가입된 이메일입니다" : "인증 메일 발송 실패";
      toast.add({
        type: "error",
        title,
        description: formatActionErrorMessage(result.error),
      });
      return;
    }

    setEmail(nextEmail);
    setPassword(nextPassword);
    setOtp("");
    setOtpReadOnly(true);
    setStep(2);
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const otpCode = otp.trim();
    if (!/^\d{6}$/.test(otpCode)) {
      toast.add({ type: "error", title: "인증 코드 6자리를 입력해 주세요." });
      return;
    }

    setPending(true);
    const result = await verifyEmailOtpAction(email, otpCode, "SIGNUP");
    setPending(false);

    if (!result.ok) {
      toast.add({ type: "error", title: "인증 실패", description: result.error });
      return;
    }

    setVerificationToken(result.data.verificationToken);
    setTermsLoading(true);
    setStep(3);
  }

  async function handleResendOtp() {
    setPending(true);
    const result = await requestEmailOtpAction(email, "SIGNUP");
    setPending(false);

    if (!result.ok) {
      toast.add({ type: "error", title: "인증 메일 재발송 실패", description: result.error });
      return;
    }

    toast.add({ type: "success", title: "인증 메일을 다시 보냈습니다" });
  }

  function toggleAll(checked: boolean) {
    setAgreements(Object.fromEntries(terms.map((term) => [term.id, checked])));
  }

  async function handleTermsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingRequired = requiredTerms.some((term) => !agreements[term.id]);
    if (missingRequired) {
      toast.add({ type: "error", title: "필수 약관에 동의해 주세요." });
      return;
    }

    const termsAgreements = terms.map((term) => ({
      termId: term.id,
      agreed: agreements[term.id] === true,
    }));

    if (isSocialMode) {
      setPending(true);
      const result = await completeSocialSignupAction(termsAgreements);
      setPending(false);

      if (!result.ok) {
        toast.add({
          type: "error",
          title: "가입 실패",
          description: formatActionErrorMessage(result.error),
        });
        return;
      }

      const signInResult = await signIn("session-tokens", {
        userUuid: result.data.userUuid,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        accessTokenExpiresAt: String(result.data.accessTokenExpiresAt),
        redirect: false,
      });

      if (signInResult?.error) {
        toast.add({ type: "error", title: "로그인에 실패했습니다." });
        return;
      }

      router.push(ROUTES.intro);
      router.refresh();
      return;
    }

    saveSignupDraft({
      email,
      password,
      verificationToken,
      termsAgreements,
    });
    router.push(ROUTES.signupProfile);
  }

  if (activeStep === 1) {
    return (
      <>
        <form className="flex w-full flex-col gap-4" onSubmit={handleCredentialsSubmit}>
        <AuthTopBar title="이메일 회원가입" backHref={ROUTES.intro} />
        <AuthField
          id="signup-email"
          name="email"
          type="email"
          label="이메일"
          placeholder="name@example.com"
          autoComplete="email"
          required
          defaultValue={email}
        />
        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="signup-password" className="m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]">
            비밀번호
          </label>
          <PasswordInput
            id="signup-password"
            name="password"
            placeholder="8자 이상 입력"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor="signup-password-confirm"
            className="m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]"
          >
            비밀번호 확인
          </label>
          <PasswordInput
            id="signup-password-confirm"
            name="passwordConfirm"
            placeholder="한 번 더 입력"
            autoComplete="new-password"
            required
          />
        </div>
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "인증 메일 발송 중..." : "다음"}
        </SubmitButton>
        <p className="text-center text-[13px] font-medium text-[var(--dl-color-text-brand)]">
          이미 계정이 있나요?{" "}
          <TextLink href={ROUTES.login} className={cn(ui.link, "text-[13px]")}>
            로그인
          </TextLink>
        </p>
      </form>
        <RestoreAccountDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          payload={restorePayload}
          onCompleted={() => {
            router.push(ROUTES.intro);
            router.refresh();
          }}
        />
      </>
    );
  }

  if (activeStep === 2) {
    return (
      <form className="flex w-full flex-col gap-4" onSubmit={handleOtpSubmit} autoComplete="off">
        <AuthTopBar title="이메일 회원가입" onBack={() => {
          setOtp("");
          setOtpReadOnly(true);
          setStep(1);
        }} />
        <p className={ui.subtitle}>{email}으로 보낸 6자리 코드를 입력하세요.</p>
        <div className={ui.field}>
          <Label htmlFor="signup-otp" className={ui.fieldLabel}>
            인증 코드
          </Label>
          <Input
            id="signup-otp"
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
          인증 메일 다시 보내기
        </button>
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "인증 확인 중..." : "인증 완료"}
        </SubmitButton>
        <p className="text-center text-[13px] text-[var(--dl-color-text-secondary)]">
          메일이 오지 않았나요? 스팸함도 확인해 주세요.
        </p>
      </form>
    );
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleTermsSubmit}>
      <AuthTopBar
        title="약관 동의"
        onBack={
          isSocialMode
            ? undefined
            : () => {
                setStep(2);
                setTermsLoading(false);
              }
        }
        backHref={isSocialMode ? ROUTES.login : undefined}
      />
      {termsLoading ? (
        <p className={ui.subtitle}>약관을 불러오는 중...</p>
      ) : null}
      {!termsLoading && terms.length === 0 ? (
        <p className={ui.subtitle}>표시할 약관이 없습니다.</p>
      ) : null}
      {terms.length > 0 ? (
        <section className="mt-2 flex flex-col gap-2.5">
          <div className="border-b border-[var(--dl-color-border-default)] pb-2.5">
            <AgreementRow
              id="agree-all"
              name="agreeAll"
              label="전체 동의"
              checked={agreeAll}
              onChange={toggleAll}
            />
          </div>
          {[...requiredTerms, ...optionalTerms].map((term) => (
            <AgreementRow
              key={term.id}
              id={`term-${term.id}`}
              name={`term-${term.id}`}
              label={`${term.required ? "(필수) " : "(선택) "}${term.title}`}
              required={term.required}
              requiredMark={term.required}
              muted={!term.required}
              checked={agreements[term.id] === true}
              onChange={(checked) =>
                setAgreements((current) => ({ ...current, [term.id]: checked }))
              }
            />
          ))}
        </section>
      ) : null}
      <SubmitButton variant="brand" disabled={!allRequiredAgreed || termsLoading || pending}>
        {pending ? "처리 중..." : "다음"}
      </SubmitButton>
      <p className="text-center text-[11px] text-[var(--dl-color-text-tertiary)]">
        선택 동의는 설정에서 언제든 변경할 수 있어요.
      </p>
    </form>
  );
}
