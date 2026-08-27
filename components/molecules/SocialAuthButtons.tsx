"use client";

import { getSafeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { cn } from "@/lib/utils";
import type { SocialProvider } from "@/types/auth/ui";
import { signIn } from "next-auth/react";
import Image from "next/image";

type SocialAuthActionLabel = "시작" | "계속";

type ProviderConfig = {
  id: SocialProvider;
  label: (action: SocialAuthActionLabel) => string;
  className: string;
  showLogo?: boolean;
};

const PROVIDERS: ProviderConfig[] = [
  {
    id: "kakao",
    label: (action) => `카카오로 ${action}`,
    className: "border-0 bg-[#FEE500] text-[rgba(0,0,0,0.85)]",
  },
  {
    id: "naver",
    label: (action) => `네이버로 ${action}`,
    className: "border-0 bg-[#03C75A] text-[#FFFFFF]",
  },
  {
    id: "google",
    label: (action) => `Google로 ${action}`,
    className: "border border-[var(--dl-color-border-default)] bg-[#FFFFFF] text-[#1F1F1F]",
    showLogo: true,
  },
];

type SocialAuthButtonsProps = {
  actionLabel?: SocialAuthActionLabel;
  callbackUrl?: string | null;
  disabled?: boolean;
  className?: string;
};

export function SocialAuthButtons({
  actionLabel = "시작",
  callbackUrl,
  disabled,
  className,
}: SocialAuthButtonsProps) {
  const targetUrl = getSafeCallbackUrl(callbackUrl);

  function handleSignIn(provider: SocialProvider) {
    void signIn(provider, { callbackUrl: targetUrl });
  }

  return (
    <div className={cn("flex w-full flex-col gap-3.5", className)}>
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--dl-radius-md)] px-5 text-sm font-medium leading-5 disabled:cursor-not-allowed disabled:opacity-50",
            provider.className,
          )}
          onClick={() => handleSignIn(provider.id)}
        >
          {provider.showLogo ? (
            <Image src="/plip/google.svg" alt="" width={20} height={20} aria-hidden />
          ) : null}
          {provider.label(actionLabel)}
        </button>
      ))}
    </div>
  );
}
