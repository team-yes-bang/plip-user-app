"use client";

import { restoreAccountAction } from "@/actions/authActions";
import { SubmitButton } from "@/components/atoms";
import { AnimatedDialog } from "@/components/molecules/AnimatedOverlays";
import { formatActionErrorMessage } from "@/lib/auth/auth-errors";
import type { UiRestorePayload } from "@/types/auth/ui";
import { signIn } from "next-auth/react";
import { useState } from "react";

type RestoreAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: UiRestorePayload | null;
  onCompleted: () => void;
};

const dialogActionClassName =
  "inline-flex h-[44px] w-auto items-center justify-center rounded-[var(--dl-radius-md)] px-5 text-sm font-medium leading-5 !no-underline";

export function RestoreAccountDialog({
  open,
  onOpenChange,
  payload,
  onCompleted,
}: RestoreAccountDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleClose() {
    if (pending) return;
    setError(null);
    onOpenChange(false);
  }

  async function handleRestore() {
    if (!payload) return;

    setPending(true);
    setError(null);

    const result = await restoreAccountAction(payload);
    if (!result.ok) {
      setError(formatActionErrorMessage(result.error));
      setPending(false);
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
      setError("복구 후 로그인에 실패했습니다.");
      setPending(false);
      return;
    }

    setPending(false);
    onOpenChange(false);
    onCompleted();
  }

  return (
    <AnimatedDialog
      open={open}
      onClose={handleClose}
      labelledBy="restore-account-title"
      className="w-[min(390px,calc(100vw-2.5rem))] rounded-[var(--dl-radius-lg)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2
          id="restore-account-title"
          className="m-0 text-base font-bold text-[var(--dl-color-text-primary)]"
        >
          탈퇴 유예 중인 계정
        </h2>
        <button
          type="button"
          aria-label="닫기"
          className="border-0 bg-[transparent] text-sm font-bold text-[var(--dl-color-text-secondary)]"
          onClick={handleClose}
          disabled={pending}
        >
          ✕
        </button>
      </div>

      <p className="m-0 text-sm leading-5 text-[var(--dl-color-text-secondary)]">
        30일 유예 기간 중입니다. 계정을 복구하시겠습니까?
      </p>

      {error ? <p className="mt-3 text-[12px] text-red-600">{error}</p> : null}

      <div className="mt-4 flex justify-end gap-2">
        <SubmitButton
          type="button"
          variant="outline"
          className={dialogActionClassName}
          disabled={pending}
          onClick={handleClose}
        >
          취소
        </SubmitButton>
        <SubmitButton
          type="button"
          variant="brand"
          className={dialogActionClassName}
          disabled={pending || !payload}
          onClick={() => void handleRestore()}
        >
          {pending ? "복구 중..." : "복구"}
        </SubmitButton>
      </div>
    </AnimatedDialog>
  );
}
