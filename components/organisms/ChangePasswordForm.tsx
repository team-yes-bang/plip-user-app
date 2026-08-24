"use client";

import { changePasswordAction } from "@/actions/userActions";
import { SubmitButton } from "@/components/atoms";
import { PasswordInput } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ChangePasswordFormProps = {
  email: string;
};

export function ChangePasswordForm({ email }: ChangePasswordFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("newPasswordConfirm") ?? "");

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setPending(true);
    setError(null);

    const result = await changePasswordAction({ currentPassword, newPassword });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    if (email) {
      const signInResult = await signIn("credentials", {
        email,
        password: newPassword,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("비밀번호 변경 후 세션 갱신에 실패했습니다.");
        setPending(false);
        return;
      }
    }

    toast.add({ type: "success", title: "비밀번호를 변경했습니다" });
    setPending(false);
    router.push(ROUTES.mypage.root);
    router.refresh();
  }

  return (
    <form className="flex w-full flex-col gap-3.5" onSubmit={handleSubmit}>
      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor="current-password" className="m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]">
          현재 비밀번호
        </label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor="new-password" className="m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]">
          새 비밀번호
        </label>
        <PasswordInput
          id="new-password"
          name="newPassword"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <label
          htmlFor="new-password-confirm"
          className="m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]"
        >
          새 비밀번호 확인
        </label>
        <PasswordInput
          id="new-password-confirm"
          name="newPasswordConfirm"
          autoComplete="new-password"
          required
        />
      </div>

      {error ? <p className="m-0 text-[12px] text-red-600">{error}</p> : null}

      <div className="mt-auto flex w-full flex-col gap-[14px]">
        <SubmitButton variant="brand" disabled={pending}>
          {pending ? "저장 중..." : "변경 적용"}
        </SubmitButton>
      </div>
    </form>
  );
}
