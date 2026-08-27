export type ApiNotificationType = "CHAT" | "JOIN_REQUEST" | "CREATION" | "TOPIC" | "POST";

export type ApiNotificationItem = {
  id: number;
  type: ApiNotificationType;
  title: string;
  body: string | null;
  deepLink: string | null;
  resourceId: string | null;
  agitUuid: string | null;
  read: boolean;
  createdAt: string | null;
};

export type ApiNotificationInboxResponse = {
  items: ApiNotificationItem[];
  unreadCount: number;
};

export type ApiNotificationUnreadCountResponse = {
  unreadCount: number;
};

export type ApiNotificationReadAllResponse = {
  updatedCount: number;
};
