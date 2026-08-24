"use client";

import { withdrawAccountAction } from "@/actions/userActions";
import { SubmitButton } from "@/components/atoms";
import { AnimatedDialog } from "@/components/molecules/AnimatedOverlays";
import { PasswordInput } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WithdrawAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  requiresPasswordConfirmation: boolean;
};

const dialogActionClassName =
  "inline-flex h-[44px] w-auto items-center justify-center rounded-[var(--dl-radius-md)] px-5 text-sm font-medium leading-5 !no-underline";

export function WithdrawAccountDialog({
  open,
  onOpenChange,
  email,
  requiresPasswordConfirmation,
}: WithdrawAccountDialogProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleClose() {
    if (pending) return;
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    setPending(true);

    const result = await withdrawAccountAction(
      requiresPasswordConfirmation && email && password ? { email, password } : {},
    );
    setPending(false);

    if (!(await handleClientActionResult(result, router, { errorTitle: "회원 탈퇴 실패" }))) {
      return;
    }

    toast.add({ type: "success", title: "회원 탈퇴가 완료되었습니다" });
    onOpenChange(false);
    router.push(ROUTES.intro);
    router.refresh();
  }

  return (
    <AnimatedDialog
      open={open}
      onClose={handleClose}
      labelledBy="withdraw-account-title"
      className="w-[min(390px,calc(100vw-2.5rem))] rounded-[var(--dl-radius-lg)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2
          id="withdraw-account-title"
          className="m-0 text-base font-bold text-[var(--dl-color-text-danger)]"
        >
          회원 탈퇴
        </h2>
        <button
          type="button"
          aria-label="닫기"
          className="border-0 bg-[transparent] text-sm font-bold text-[var(--dl-color-text-secondary)]"
          onClick={handleClose}
        >
          ✕
        </button>
      </div>

      <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]">
        탈퇴 후 30일 유예 기간이 적용됩니다. 유예 기간 중 복구할 수 있습니다.
      </p>

      <div className="my-3 w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-danger)] p-[12px_14px]">
        <p className="m-0 text-[13px] leading-[18px] text-[var(--dl-color-text-danger)]">
          탈퇴 시 업로드한 영상과 방별 프로필 데이터가 삭제될 수 있으며, 복구가 어려울 수 있습니다.
        </p>
      </div>

      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        {requiresPasswordConfirmation ? (
          <div className="flex w-full flex-col gap-1.5">
            <label
              htmlFor="withdraw-password"
              className="m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]"
            >
              비밀번호 확인
            </label>
            <PasswordInput
              id="withdraw-password"
              name="password"
              autoComplete="current-password"
            />
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
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
            type="submit"
            variant="outline"
            className={`${dialogActionClassName} !text-[var(--dl-color-text-danger)]`}
            disabled={pending}
          >
            {pending ? "처리 중..." : "탈퇴"}
          </SubmitButton>
        </div>
      </form>
    </AnimatedDialog>
  );
}
