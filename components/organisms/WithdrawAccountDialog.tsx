"use client";

import { withdrawAccountAction } from "@/actions/userActions";
import { SubmitButton } from "@/components/atoms";
import { FormField, PasswordInput } from "@/components/molecules";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WithdrawAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
};

export function WithdrawAccountDialog({
  open,
  onOpenChange,
  email,
}: WithdrawAccountDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    setPending(true);
    setError(null);

    const result = await withdrawAccountAction(
      email && password ? { email, password } : {},
    );
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.add({ type: "success", title: "회원 탈퇴가 완료되었습니다" });
    onOpenChange(false);
    router.push(ROUTES.intro);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!pending}
        className="w-full rounded-[var(--dl-radius-lg)] border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px]"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="m-0 text-base font-bold text-[var(--dl-color-text-danger)]">
              회원 탈퇴
            </DialogTitle>
            <DialogDescription className="m-0 text-sm text-[var(--dl-color-text-secondary)]">
              탈퇴 후 30일 유예 기간이 적용됩니다. 유예 기간 중 복구할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-danger)] p-[12px_14px]">
            <p className="m-0 text-[13px] leading-[18px] text-[var(--dl-color-text-danger)]">
              탈퇴 시 업로드한 영상과 방별 프로필 데이터가 삭제될 수 있으며, 복구가 어려울 수 있습니다.
            </p>
          </div>

          {email ? (
            <FormField label="비밀번호 확인" htmlFor="withdraw-password">
              <PasswordInput
                id="withdraw-password"
                name="password"
                autoComplete="current-password"
              />
            </FormField>
          ) : null}

          {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

          <DialogFooter className="mt-4 border-0 bg-transparent p-0">
            <SubmitButton
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              취소
            </SubmitButton>
            <SubmitButton type="submit" variant="outline" disabled={pending}>
              {pending ? "처리 중..." : "탈퇴"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
