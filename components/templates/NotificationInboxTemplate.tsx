"use client";

import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/notificationActions";
import { ScreenHeader } from "@/components/molecules";
import { NotificationInboxList } from "@/components/organisms/NotificationInboxList";
import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { ROUTES } from "@/config/routes";
import type { UiInboxNotification, UiNotificationInbox } from "@/types/notification/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationInboxTemplateProps = {
  inbox?: UiNotificationInbox;
  items?: UiInboxNotification[];
};

function fromLegacy(items: UiInboxNotification[]): UiNotificationInbox {
  const mapped = items.map((item) => ({
    id: item.id,
    type: item.type === "JOIN_REQUESTED" || item.type === "JOIN_REJECTED" ? "JOIN_REQUEST" as const : "CREATION" as const,
    title: item.title,
    body: item.body,
    href: item.href,
    read: !item.unread,
    createdAt: item.createdAt,
  }));
  return {
    items: mapped,
    unreadCount: mapped.filter((item) => !item.read).length,
  };
}

export function NotificationInboxTemplate({ inbox, items }: NotificationInboxTemplateProps) {
  const router = useRouter();
  const [state, setState] = useState<UiNotificationInbox>(
    inbox ?? fromLegacy(items ?? []),
  );

  async function handleMarkAllRead() {
    const result = await markAllNotificationsReadAction();
    if (result.ok) {
      setState({
        items: state.items.map((item) => ({ ...item, read: true })),
        unreadCount: 0,
      });
    }
  }

  return (
    <AppChromeTemplate
      activeTab="mypage"
      variant="light"
      padded="none"
      header={
        <ScreenHeader
          tone="sticky"
          backHref={ROUTES.home}
          title="알림"
          trailing={
            <button
              type="button"
              className="border-0 bg-transparent text-[0.8rem] font-semibold text-[var(--dl-color-text-brand)]"
              onClick={() => void handleMarkAllRead()}
            >
              모두 읽음
            </button>
          }
        />
      }
    >
      <div className="px-6 pb-8 pt-2">
        <p className="mb-3 text-xs text-[var(--dl-color-text-secondary)]">
          읽지 않은 알림 {state.unreadCount}개
        </p>
        <NotificationInboxList
          items={state.items}
          variant="light"
          onItemClick={(item) => {
            void markNotificationReadAction(item.id);
            router.push(item.href);
          }}
        />
      </div>
    </AppChromeTemplate>
  );
}
