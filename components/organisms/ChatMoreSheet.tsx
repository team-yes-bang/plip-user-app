"use client";

import { DailyIcon, TextLink } from "@/components/atoms";
import { useOverlayTransition } from "@/hooks/useOverlayTransition";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type ChatMoreSheetProps = {
  agitId: string;
  open: boolean;
  notify: boolean;
  myRole?: "HOST" | "GUEST";
  onClose: () => void;
  onToggleNotify: () => void;
};

const MENU = [
  {
    id: "poll",
    title: "투표 만들기",
    description: "방 멤버와 빠르게 의견을 모읍니다",
    icon: "list" as const,
    href: (id: string) => ROUTES.agit.poll(id),
  },
  {
    id: "members",
    title: "멤버 보기",
    description: "참여 중인 멤버와 권한 확인",
    icon: "users" as const,
    href: (id: string) => ROUTES.agit.members(id),
  },
  {
    id: "manage",
    title: "방 관리",
    description: "초대·안전 설정",
    icon: "usersBrand" as const,
    href: (id: string) => ROUTES.agit.manage(id),
  },
  {
    id: "notifications",
    title: "알림 설정",
    description: "기능별·방별 알림 조정",
    icon: "bell" as const,
    href: () => ROUTES.mypage.notifications,
  },
] as const;

export function ChatMoreSheet({
  agitId,
  open,
  notify,
  myRole,
  onClose,
  onToggleNotify,
}: ChatMoreSheetProps) {
  const { mounted, visible } = useOverlayTransition(open);
  const items = MENU.filter((item) => item.id !== "manage" || myRole !== "GUEST");

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        className={cn(
          "absolute inset-0 z-[41] border-0 bg-[rgba(0,0,0,0.32)] [transition:opacity_280ms_ease] motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute bottom-[96px] left-1/2 z-[42] flex w-[min(300px,calc(100%-48px))] flex-col gap-2 rounded-[20px] bg-[rgba(252,251,255,0.98)] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.22)] [transition:opacity_280ms_ease,transform_280ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          visible
            ? "opacity-100 [transform:translate(-50%,0)_scale(1)]"
            : "opacity-0 [transform:translate(-50%,12px)_scale(0.96)]",
        )}
        role="dialog"
        aria-modal
        aria-label="채팅 더보기"
        aria-hidden={!visible}
      >
        <button type="button" className="flex items-center gap-[12px] min-h-[64px] w-full p-[13px] border border-[var(--dl-color-border-default)] rounded-[14px] bg-[var(--dl-color-bg-elevated)] text-left cursor-pointer" onClick={onToggleNotify}>
          <DailyIcon name="bell" size={24} />
          <span className="min-w-0 flex-1 text-left">
            <p className="text-[var(--dl-color-text-danger)] m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">채팅 알림 {notify ? "끄기" : "켜기"}</p>
            <p className="text-[var(--dl-color-text-danger)] m-[4px_0_0] text-[11px] text-[var(--dl-color-text-secondary)]">
              {notify ? "새 메시지 푸시를 받지 않습니다" : "새 메시지 푸시를 받습니다"}
            </p>
          </span>
          <span className={`text-[var(--dl-color-text-danger)] text-xl text-[var(--dl-color-text-tertiary)]${notify ? "" : " opacity-40"}`} aria-hidden>
            {notify ? "ON" : "OFF"}
          </span>
        </button>

        {items.map((item) => (
          <TextLink
            key={item.id}
            href={item.href(agitId)}
            className="flex items-center gap-[12px] min-h-[64px] w-full p-[13px] border border-[var(--dl-color-border-default)] rounded-[14px] bg-[var(--dl-color-bg-elevated)] text-left cursor-pointer no-underline"
            onClick={onClose}
          >
            <DailyIcon name={item.icon} size={24} />
            <span className="min-w-0 flex-1 text-left">
              <p className="text-[var(--dl-color-text-danger)] m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">{item.title}</p>
              <p className="text-[var(--dl-color-text-danger)] m-[4px_0_0] text-[11px] text-[var(--dl-color-text-secondary)]">{item.description}</p>
            </span>
            <span className="text-[var(--dl-color-text-danger)] text-xl text-[var(--dl-color-text-tertiary)]" aria-hidden>
              ›
            </span>
          </TextLink>
        ))}
      </div>
    </>
  );
}
