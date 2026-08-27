"use client";

import { markInboxNotificationReadAction } from "@/actions/notificationActions";
import { TextLink } from "@/components/atoms";
import type { UiInboxNotification } from "@/types/notification/ui";
import { useRouter } from "next/navigation";

export function NotificationInboxSection({
  items,
}: {
  items: UiInboxNotification[];
}) {
  const router = useRouter();

  async function handleOpen(item: UiInboxNotification) {
    if (item.id.startsWith("stored:") && item.unread) {
      await markInboxNotificationReadAction(item.id);
    }
    router.push(item.href);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]">
        아직 받은 알림이 없어요.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((item) => (
        <li key={item.id}>
          <TextLink
            href={item.href}
            onClick={(event) => {
              event.preventDefault();
              void handleOpen(item);
            }}
            className="flex flex-col gap-1 rounded-2xl border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-3 !no-underline"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--dl-color-text-primary)]">
                {item.title}
              </span>
              {item.unread ? (
                <span className="size-2 shrink-0 rounded-full bg-[var(--dl-color-bg-brand)]" aria-label="읽지 않음" />
              ) : null}
            </span>
            {item.body ? (
              <span className="text-xs text-[var(--dl-color-text-secondary)]">{item.body}</span>
            ) : null}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
