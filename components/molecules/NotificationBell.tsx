"use client";

import {
  getNotificationInboxAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notificationActions";
import { DailyIcon } from "@/components/atoms";
import { AnimatedDropdown } from "@/components/molecules/AnimatedOverlays";
import { NotificationInboxList } from "@/components/organisms/NotificationInboxList";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { UiNotificationInbox } from "@/types/notification/ui";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type NotificationBellProps = {
  variant?: "feed" | "light";
  unreadCount?: number;
};

function unreadLabel(count: number): string {
  if (count <= 0) {
    return "";
  }
  return count > 99 ? "99+" : String(count);
}

export function NotificationBell({ variant = "light", unreadCount = 0 }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState<UiNotificationInbox>({
    items: [],
    unreadCount,
  });

  const refresh = useCallback(async () => {
    const result = await getNotificationInboxAction();
    if (result.ok) {
      setInbox(result.data);
    }
  }, []);

  useEffect(() => {
    const immediate = window.setTimeout(() => {
      void refresh();
    }, 0);
    const timer = window.setInterval(() => {
      void refresh();
    }, 30_000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(timer);
    };
  }, [refresh]);

  async function handleMarkRead(id: string) {
    const result = await markNotificationReadAction(id);
    if (result.ok) {
      setInbox((current) => ({
        items: current.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        unreadCount: Math.max(
          0,
          current.unreadCount - (current.items.find((item) => item.id === id && !item.read) ? 1 : 0),
        ),
      }));
    }
  }

  async function handleMarkAllRead() {
    const result = await markAllNotificationsReadAction();
    if (result.ok) {
      setInbox((current) => ({
        items: current.items.map((item) => ({ ...item, read: true })),
        unreadCount: 0,
      }));
    }
  }

  const countLabel = unreadLabel(inbox.unreadCount);
  const isFeed = variant === "feed";

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "relative inline-flex items-center justify-center no-underline",
          isFeed
            ? "size-9 rounded-[var(--dc-btn-radius)] border border-[var(--dc-glass-dark-border)] bg-[linear-gradient(180deg,var(--dc-glass-dark-from),var(--dc-glass-dark-to))] text-white backdrop-blur-[16px]"
            : "size-11 rounded-[var(--dl-radius-md)] border-0 bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-primary)]",
        )}
        aria-label={countLabel ? `알림 ${countLabel}개` : "알림"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((current) => !current);
          void refresh();
        }}
      >
        <DailyIcon name="bell" size={isFeed ? 18 : 20} className={isFeed ? "brightness-0 invert" : ""} />
        {countLabel ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[#ff3b5c] px-1 text-[10px] font-bold leading-4 text-white">
            {countLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[20] cursor-default border-0 bg-transparent"
          aria-label="알림 닫기"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <AnimatedDropdown
        open={open}
        role="dialog"
        aria-label="알림"
        className={cn(
          "absolute right-0 top-[calc(100%+0.4rem)] z-[21] w-[min(20.5rem,calc(100vw-1.7rem))] overflow-hidden rounded-[16px] border shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
          isFeed
            ? "border-[var(--dc-glass-dark-border)] bg-[rgba(18,18,22,0.92)] text-white backdrop-blur-[20px]"
            : "border-black/8 bg-white text-[var(--dl-color-text-primary)]",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
          <strong className="text-[0.9rem] font-semibold">알림</strong>
          <button
            type="button"
            className={cn(
              "border-0 bg-transparent text-[0.75rem] font-semibold",
              isFeed ? "text-white/72" : "text-[var(--dl-color-text-secondary)]",
            )}
            onClick={() => void handleMarkAllRead()}
          >
            모두 읽음
          </button>
        </div>
        <NotificationInboxList
          items={inbox.items.slice(0, 6)}
          variant={variant}
          compact
          onItemClick={(item) => {
            void handleMarkRead(item.id);
            setOpen(false);
          }}
        />
        <Link
          href={ROUTES.notifications}
          className={cn(
            "block border-t px-3.5 py-2.5 text-center text-[0.78rem] font-semibold no-underline",
            isFeed ? "border-white/10 text-white" : "border-black/6 text-[var(--dl-color-text-brand)]",
          )}
          onClick={() => setOpen(false)}
        >
          전체 알림 보기
        </Link>
      </AnimatedDropdown>
    </div>
  );
}
