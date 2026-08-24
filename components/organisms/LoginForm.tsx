"use client";

import { SubmitButton, TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import { AuthDivider, AuthField, SocialAuthButtons } from "@/components/molecules";
import { RestoreAccountDialog } from "@/components/organisms/RestoreAccountDialog";
import { ROUTES } from "@/config/routes";
import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import { getSafeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { isSocialProvider } from "@/lib/auth/social-providers";
import type { UiRestorePayload } from "@/types/auth/ui";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function resolveOAuthErrorMessage(searchParams: URLSearchParams): string | null {
  const error = searchParams.get("error");
  if (!error) return null;

  if (error === "social_backend") {
    const provider = searchParams.get("provider") ?? "소셜";
    const status = searchParams.get("status");
    const backendMessage = searchParams.get("message");
    const decoded = backendMessage ? decodeURIComponent(backendMessage) : null;
    const statusLabel = status ? ` (${status})` : "";
    return (
      decoded ??
      `${provider} 로그인 API 연동 실패${statusLabel}. API_URL과 user-service 기동을 확인해 주세요.`
    );
  }

  const messages: Record<string, string> = {
    AccessDenied: "소셜 로그인이 거부되었습니다. OAuth 설정 또는 백엔드 연동을 확인해 주세요.",
    Configuration: "OAuth Client ID/Secret 설정을 확인해 주세요.",
    OAuthCallback: "OAuth 인증 중 오류가 발생했습니다. Redirect URI를 확인해 주세요.",
    OAuthSignin: "OAuth 로그인을 시작하지 못했습니다. Client ID/Secret을 확인해 주세요.",
    CallbackRouteError: "OAuth callback 처리 중 오류가 발생했습니다.",
  };

  return messages[error] ?? "로그인 중 오류가 발생했습니다.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const urlError = resolveOAuthErrorMessage(searchParams);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const error = submitError ?? urlError;
  const [pending, setPending] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restorePayload, setRestorePayload] = useState<UiRestorePayload | null>(null);
  const [dismissedUrlRestore, setDismissedUrlRestore] = useState(false);

  const urlRestorePayload = useMemo((): UiRestorePayload | null => {
    const restore = searchParams.get("restore");
    const provider = searchParams.get("provider");
    if (restore !== "pending" || !isSocialProvider(provider)) {
      return null;
    }
    return { type: "social-pending", provider };
  }, [searchParams]);

  useEffect(() => {
    if (!urlRestorePayload) {
      return;
    }
    router.replace(ROUTES.login);
  }, [router, urlRestorePayload]);

  const activeRestorePayload = restorePayload ?? urlRestorePayload;
  const activeRestoreOpen =
    restoreOpen || (urlRestorePayload !== null && !dismissedUrlRestore);

  function handleRestoreOpenChange(open: boolean) {
    setRestoreOpen(open);
    if (!open && urlRestorePayload) {
      setDismissedUrlRestore(true);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.code === AUTH_ERROR_CODES.PENDING_RESTORE) {
      setRestorePayload({ type: "local", email, password });
      setRestoreOpen(true);
      return;
    }

    if (result?.error) {
      setSubmitError("이메일 또는 비밀번호를 확인해 주세요.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <>
      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          id="login-email"
          name="email"
          type="email"
          label="이메일"
          placeholder="name@example.com"
          autoComplete="email"
          required
        />
        <AuthField
          id="login-password"
          name="password"
          type="password"
          label="비밀번호"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
        <TextLink
          href={ROUTES.forgotPassword}
          className={cn(ui.link, "self-end text-right text-[12px] leading-[15px]")}
        >
          비밀번호를 잊으셨나요?
        </TextLink>
        <SubmitButton variant="brand" disabled={pending}>
          로그인
        </SubmitButton>
        <AuthDivider />
        <SocialAuthButtons
          actionLabel="계속"
          callbackUrl={searchParams.get("callbackUrl")}
          disabled={pending}
        />
        <p className="text-center text-[13px] font-medium leading-4 text-[var(--dl-color-text-brand)]">
          계정이 없나요?{" "}
          <TextLink href={ROUTES.signup} className={cn(ui.link, "text-[13px]")}>
            회원가입
          </TextLink>
        </p>
      </form>

      <RestoreAccountDialog
        open={activeRestoreOpen}
        onOpenChange={handleRestoreOpenChange}
        payload={activeRestorePayload}
        onCompleted={() => {
          router.push(callbackUrl);
          router.refresh();
        }}
      />
    </>
  );
}
