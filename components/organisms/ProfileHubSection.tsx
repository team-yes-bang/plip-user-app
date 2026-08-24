"use client";

import { logoutAction } from "@/actions/authActions";
import { SubmitButton, TextLink, UserAvatar } from "@/components/atoms";
import { SettingsRow } from "@/components/molecules/SettingsRow";
import { WithdrawAccountDialog } from "@/components/organisms/WithdrawAccountDialog";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { DEFAULT_PROFILE_AVATAR, type UiUserProfile } from "@/types/user/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileHubSectionProps = {
  profile: UiUserProfile | null;
};

export function ProfileHubSection({ profile }: ProfileHubSectionProps) {
  const router = useRouter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayProfile: UiUserProfile = profile ?? {
    userUuid: "",
    nickname: "사용자",
    profileImageUrl: DEFAULT_PROFILE_AVATAR,
    email: "",
  };

  const nickname = displayProfile.nickname.trim() || "사용자";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    const result = await logoutAction();
    setLoggingOut(false);

    if (!result.ok) {
      toast.add({
        type: "error",
        title: "로그아웃에 실패했습니다",
        description: result.error,
      });
      return;
    }

    router.push(ROUTES.login);
    router.refresh();
  }

  return (
    <>
      <section className="flex w-full flex-col gap-3.5 pb-6" aria-label="마이페이지">
        <h1 className="m-0 text-[26px] font-bold text-[var(--dl-color-text-primary)]">마이페이지</h1>

        <div className="flex w-full items-center gap-[12px] rounded-[18px] bg-[var(--dl-color-bg-brand-subtle)] p-[14px]">
          <UserAvatar src={displayProfile.profileImageUrl} size={64} />
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <p className="m-0 truncate text-[17px] font-semibold leading-[1.35] text-[var(--dl-color-text-primary)]">
              {nickname}
            </p>
            {displayProfile.email ? (
              <p className="m-0 truncate text-xs text-[var(--dl-color-text-secondary)]">
                {displayProfile.email}
              </p>
            ) : null}
          </div>
          <TextLink
            href={ROUTES.mypage.profile}
            className="inline-flex h-[36px] shrink-0 items-center justify-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)] px-3 text-sm font-medium leading-5 !text-[var(--dl-color-text-brand)] !no-underline"
          >
            수정
          </TextLink>
        </div>

        <div className="flex w-full items-center justify-between rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[14px]">
          <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">보유 포인트</p>
          <p className="m-0 text-[20px] font-bold text-[var(--dl-color-text-brand)]">2,900 P</p>
        </div>

        <div
          className="relative flex w-full items-center gap-[12px] rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[14px] opacity-50"
          aria-disabled
        >
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">상점</p>
            <p className="m-0 text-xs text-[var(--dl-color-text-secondary)]">방 꾸미기·아이템</p>
          </div>
          <span className="inline-flex h-[28px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--dl-color-bg-brand-subtle)] px-3 text-xs font-semibold text-[var(--dl-color-text-brand)]">
            업데이트 예정
          </span>
        </div>

        <h2 className="m-0 text-base font-semibold leading-[23px] text-[var(--dl-color-text-primary)]">설정</h2>
        <SettingsRow
          href={ROUTES.mypage.password}
          title="비밀번호 변경"
          description="계정 비밀번호 수정"
        />
        <SettingsRow
          href={ROUTES.mypage.notifications}
          title="알림 설정"
          description="아지트·다이어리 알림"
        />
        <SettingsRow
          href={ROUTES.mypage.termsAgreements}
          title="선택 약관 동의"
          description="마케팅 등 선택 약관 관리"
        />

        <h2 className="m-0 text-base font-semibold leading-[23px] text-[var(--dl-color-text-primary)]">계정</h2>
        <SubmitButton
          type="button"
          variant="outline"
          className="w-full"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          {loggingOut ? "로그아웃 중..." : "로그아웃"}
        </SubmitButton>
        <button
          type="button"
          className="cursor-pointer border-0 bg-[transparent] p-0 pb-2 text-center text-xs font-medium text-[var(--dl-color-text-danger)]"
          onClick={() => setWithdrawOpen(true)}
        >
          회원 탈퇴
        </button>
      </section>

      <WithdrawAccountDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        email={displayProfile.email}
      />
    </>
  );
}
