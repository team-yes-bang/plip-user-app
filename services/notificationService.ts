import { ApiError } from "@/lib/api/apiFetch";
import * as notificationApi from "@/lib/api/notificationApi";
import { getServerUserUuid } from "@/lib/auth/server-token";
import {
  countLocalUnread,
  listLocalInbox,
  markLocalAllRead,
  markLocalRead,
  seedLocalInbox,
} from "@/lib/notification/localInboxStore";
import {
  appendInboxNotification,
  countUnreadInbox,
  listInboxNotifications,
  markInboxNotificationRead,
} from "@/lib/notifications/inbox";
import type { ApiNotificationInboxResponse, ApiNotificationItem } from "@/types/notification/api";
import type { UiInboxNotification, UiInboxNotificationType, UiNotificationInbox, UiNotificationItem, UiNotificationType } from "@/types/notification/ui";
import { INBOX_COPY } from "@/types/notification/ui";
import { ROUTES } from "@/config/routes";

function isMissingRemoteInbox(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 405 || error.status === 501);
}

async function requireUserUuid(explicit?: string): Promise<string> {
  if (explicit) {
    return explicit;
  }
  const userUuid = await getServerUserUuid();
  if (!userUuid) {
    throw new Error("로그인이 필요합니다.");
  }
  return userUuid;
}

function mapType(type: string): UiNotificationType {
  if (type === "JOIN_REQUESTED" || type === "JOIN_REQUEST") {
    return "JOIN_REQUEST";
  }
  if (type === "JOIN_APPROVED" || type === "CREATION") {
    return "CREATION";
  }
  if (type === "TOPIC" || type === "CHAT" || type === "POST") {
    return type;
  }
  if (type === "JOIN_REJECTED") {
    return "JOIN_REQUEST";
  }
  return "POST";
}

function mapRemoteItem(item: ApiNotificationItem): UiNotificationItem {
  return {
    id: `remote:${item.id}`,
    type: mapType(item.type),
    title: item.title,
    body: item.body ?? "",
    href: item.deepLink && item.deepLink.startsWith("/") ? item.deepLink : ROUTES.notifications,
    read: item.read,
    createdAt: item.createdAt,
  };
}

function mapLegacyItem(item: UiInboxNotification): UiNotificationItem {
  return {
    id: item.id,
    type: mapType(item.type),
    title: item.title,
    body: item.body,
    href: item.href.startsWith("/") ? item.href : ROUTES.notifications,
    read: !item.unread,
    createdAt: item.createdAt,
  };
}

function mapLocalInbox(data: ApiNotificationInboxResponse): UiNotificationInbox {
  return {
    items: (data.items ?? []).map((item) => ({
      id: `local:${item.id}`,
      type: mapType(item.type),
      title: item.title,
      body: item.body ?? "",
      href: item.deepLink && item.deepLink.startsWith("/") ? item.deepLink : ROUTES.notifications,
      read: item.read,
      createdAt: item.createdAt,
    })),
    unreadCount: data.unreadCount ?? 0,
  };
}

function toInbox(items: UiNotificationItem[]): UiNotificationInbox {
  const sorted = [...items].sort((left, right) => {
    const leftAt = left.createdAt ? Date.parse(left.createdAt) : 0;
    const rightAt = right.createdAt ? Date.parse(right.createdAt) : 0;
    return rightAt - leftAt;
  });
  return {
    items: sorted,
    unreadCount: sorted.filter((item) => !item.read).length,
  };
}

async function loadFallbackInbox(userUuid: string): Promise<UiNotificationInbox> {
  const [legacy, local] = await Promise.all([
    listInboxNotifications(userUuid)
      .then((items) => items.map(mapLegacyItem))
      .catch(() => []),
    listLocalInbox(userUuid)
      .then((data) => mapLocalInbox(data).items)
      .catch(() => []),
  ]);
  return toInbox([...legacy, ...local]);
}

export async function getNotificationInbox(limit = 30): Promise<UiNotificationInbox> {
  let remoteItems: UiNotificationItem[] = [];
  try {
    const remote = await Promise.race([
      notificationApi.listNotifications(limit),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("notification-api-timeout")), 2500);
      }),
    ]);
    remoteItems = (remote.items ?? []).map(mapRemoteItem);
  } catch {
    remoteItems = [];
  }

  let liveItems: UiNotificationItem[] = [];
  try {
    const userUuid = await getServerUserUuid();
    if (userUuid) {
      liveItems = (await listInboxNotifications(userUuid)).map(mapLegacyItem);
    }
  } catch {
    liveItems = [];
  }

  const merged = toInbox([...liveItems, ...remoteItems]);
  if (merged.items.length > 0) {
    return merged;
  }

  try {
    return await loadFallbackInbox(await requireUserUuid());
  } catch {
    return { items: [], unreadCount: 0 };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const result = await notificationApi.getUnreadNotificationCount();
    return result.unreadCount;
  } catch (error) {
    if (!isMissingRemoteInbox(error)) {
      throw error;
    }
    const userUuid = await requireUserUuid();
    const [legacyCount, localCount] = await Promise.all([
      countUnreadInbox(userUuid).catch(() => 0),
      countLocalUnread(userUuid).catch(() => 0),
    ]);
    return legacyCount + localCount;
  }
}

export async function getInboxUnreadCount(userUuid: string): Promise<number> {
  try {
    return await getUnreadNotificationCount();
  } catch {
    return countUnreadInbox(userUuid).catch(() => 0);
  }
}

export async function getInboxNotifications(userUuid: string): Promise<UiInboxNotification[]> {
  const inbox = await getNotificationInbox();
  void userUuid;
  return inbox.items.map((item) => ({
    id: item.id,
    type: item.type === "JOIN_REQUEST" ? "JOIN_REQUESTED" : "JOIN_APPROVED",
    title: item.title,
    body: item.body,
    href: item.href,
    createdAt: item.createdAt,
    unread: !item.read,
  }));
}

export async function markNotificationRead(id: string): Promise<UiNotificationItem | void> {
  if (id.startsWith("remote:")) {
    const numericId = Number(id.slice("remote:".length));
    const item = await notificationApi.markNotificationRead(numericId);
    return mapRemoteItem(item);
  }
  if (id.startsWith("local:")) {
    const numericId = Number(id.slice("local:".length));
    const item = await markLocalRead(await requireUserUuid(), numericId);
    return mapLocalInbox({ items: [item], unreadCount: 0 }).items[0];
  }
  if (id.startsWith("stored:")) {
    await markInboxNotificationRead(id, await requireUserUuid());
  }
}

export async function markInboxRead(id: string, userUuid: string): Promise<void> {
  await markNotificationRead(id);
  void userUuid;
}

export async function markAllNotificationsRead(): Promise<number> {
  try {
    const result = await notificationApi.markAllNotificationsRead();
    return result.updatedCount;
  } catch (error) {
    if (!isMissingRemoteInbox(error)) {
      throw error;
    }
    const userUuid = await requireUserUuid();
    return markLocalAllRead(userUuid);
  }
}

export async function seedNotifications(): Promise<UiNotificationInbox> {
  try {
    const remote = await notificationApi.seedNotifications();
    return {
      items: (remote.items ?? []).map(mapRemoteItem),
      unreadCount: remote.unreadCount ?? 0,
    };
  } catch (error) {
    if (!isMissingRemoteInbox(error)) {
      throw error;
    }
    return mapLocalInbox(await seedLocalInbox(await requireUserUuid()));
  }
}

export async function ensureSeededInbox(): Promise<UiNotificationInbox> {
  const inbox = await getNotificationInbox();
  if (inbox.items.length > 0) {
    return inbox;
  }
  return seedNotifications();
}

export async function notifyJoinOutcome(input: {
  requesterUserUuid: string;
  agitId: string;
  agitName: string;
  approved: boolean;
}): Promise<void> {
  const type: UiInboxNotificationType = input.approved ? "JOIN_APPROVED" : "JOIN_REJECTED";
  await appendInboxNotification({
    userUuid: input.requesterUserUuid,
    type,
    title: INBOX_COPY[type],
    body: input.approved
      ? `${input.agitName} 입장 요청이 승인되었습니다.`
      : `${input.agitName} 입장 요청이 거절되었습니다.`,
    href: input.approved ? `/agit/${input.agitId}` : "/agit/search",
    agitUuid: input.agitId,
  });
}
