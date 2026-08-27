export type UiNotificationType = "CHAT" | "JOIN_REQUEST" | "CREATION" | "TOPIC" | "POST";

export type UiNotificationItem = {
  id: string;
  type: UiNotificationType;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string | null;
};

export type UiNotificationInbox = {
  items: UiNotificationItem[];
  unreadCount: number;
};

export const NOTIFICATION_TYPE_LABEL: Record<UiNotificationType, string> = {
  CHAT: "채팅",
  JOIN_REQUEST: "입장 요청",
  CREATION: "생성",
  TOPIC: "토픽",
  POST: "새 글",
};

/** @deprecated 가입 승인 에이전트 호환. 인박스 단일 타입은 UiNotificationType */
export type UiInboxNotificationType = "JOIN_REQUESTED" | "JOIN_APPROVED" | "JOIN_REJECTED";

/** @deprecated 가입 승인 에이전트 호환 */
export type UiInboxNotification = {
  id: string;
  type: UiInboxNotificationType;
  title: string;
  body: string;
  href: string;
  createdAt: string | null;
  unread: boolean;
};

export const INBOX_COPY: Record<UiInboxNotificationType, string> = {
  JOIN_REQUESTED: "입장 요청이 있습니다",
  JOIN_APPROVED: "입장 요청이 승인되었습니다",
  JOIN_REJECTED: "입장 요청이 거절되었습니다",
};
