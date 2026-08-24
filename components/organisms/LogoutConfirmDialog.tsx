"use client";

import { logoutAction } from "@/actions/authActions";
import { SubmitButton } from "@/components/atoms";
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

type LogoutConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);

    const result = await logoutAction();
    setPending(false);

    if (!result.ok) {
      toast.add({
        type: "error",
        title: "로그아웃에 실패했습니다",
        description: result.error,
      });
      return;
    }

    onOpenChange(false);
    router.push(ROUTES.login);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!pending}
        className="w-full rounded-[var(--dl-radius-lg)] border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px]"
      >
        <DialogHeader>
          <DialogTitle className="m-0 text-base font-bold text-[var(--dl-color-text-primary)]">
            로그아웃
          </DialogTitle>
          <DialogDescription className="m-0 text-sm text-[var(--dl-color-text-secondary)]">
            로그아웃 하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-0 bg-transparent p-0">
          <SubmitButton
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            취소
          </SubmitButton>
          <SubmitButton type="button" variant="brand" disabled={pending} onClick={handleLogout}>
            {pending ? "처리 중..." : "로그아웃"}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
