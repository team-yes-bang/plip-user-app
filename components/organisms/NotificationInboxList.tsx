import { TextLink } from "@/components/atoms";
import { NOTIFICATION_TYPE_LABEL } from "@/types/notification/ui";
import type { UiNotificationItem } from "@/types/notification/ui";
import { cn } from "@/lib/utils";

type NotificationInboxListProps = {
  items: UiNotificationItem[];
  variant?: "feed" | "light";
  compact?: boolean;
  onItemClick?: (item: UiNotificationItem) => void;
};

function formatTime(value: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function NotificationInboxList({
  items,
  variant = "light",
  compact = false,
  onItemClick,
}: NotificationInboxListProps) {
  const isFeed = variant === "feed";

  if (items.length === 0) {
    return (
      <p className={cn("px-4 py-6 text-center text-sm", isFeed ? "text-white/62" : "text-black/45")}>
        새 알림이 없습니다.
      </p>
    );
  }

  return (
    <ul className={cn("m-0 list-none p-0", compact ? "max-h-[22rem] overflow-y-auto" : "flex flex-col gap-2")}>
      {items.map((item) => (
        <li key={item.id}>
          <TextLink
            href={item.href}
            onClick={() => onItemClick?.(item)}
            className={cn(
              "block no-underline",
              compact ? "px-3.5 py-2.5" : "rounded-[16px] border px-4 py-3",
              item.read ? "opacity-70" : "",
              isFeed
                ? compact
                  ? "text-white hover:bg-white/8"
                  : "border-white/10 bg-white/6 text-white"
                : compact
                  ? "text-[var(--dl-color-text-primary)] hover:bg-black/4"
                  : "border-black/6 bg-white text-[var(--dl-color-text-primary)]",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-[0.68rem] font-semibold uppercase tracking-wide",
                  isFeed ? "text-white/55" : "text-[var(--dl-color-text-secondary)]",
                )}
              >
                {NOTIFICATION_TYPE_LABEL[item.type]}
              </span>
              <span className={cn("text-[0.68rem]", isFeed ? "text-white/45" : "text-black/35")}>
                {formatTime(item.createdAt)}
              </span>
            </div>
            <p className={cn("m-0 mt-1 text-[0.88rem] font-semibold", item.read ? "" : "font-bold")}>
              {item.title}
            </p>
            {item.body ? (
              <p className={cn("m-0 mt-0.5 line-clamp-2 text-[0.78rem]", isFeed ? "text-white/68" : "text-black/55")}>
                {item.body}
              </p>
            ) : null}
            {!item.read ? (
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ff3b5c]" aria-hidden />
            ) : null}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
