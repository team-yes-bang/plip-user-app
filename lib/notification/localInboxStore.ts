import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ApiNotificationInboxResponse,
  ApiNotificationItem,
  ApiNotificationType,
} from "@/types/notification/api";

type StoreUser = {
  seq: number;
  items: ApiNotificationItem[];
};

type StoreFile = {
  users: Record<string, StoreUser>;
};

const STORE_PATH = path.join(process.cwd(), ".data", "notifications.json");

const SEED_ITEMS: Array<Omit<ApiNotificationItem, "id" | "read" | "createdAt">> = [
  {
    type: "CHAT",
    title: "새 채팅 메시지",
    body: "아지트에서 새 메시지가 도착했습니다.",
    deepLink: "/agit",
    resourceId: "seed-chat",
    agitUuid: null,
  },
  {
    type: "JOIN_REQUEST",
    title: "입장 요청",
    body: "누군가 아지트 입장을 요청했습니다.",
    deepLink: "/agit",
    resourceId: "seed-join",
    agitUuid: null,
  },
  {
    type: "CREATION",
    title: "아지트가 생성되었습니다",
    body: "새 아지트가 준비되었습니다.",
    deepLink: "/agit",
    resourceId: "seed-creation",
    agitUuid: null,
  },
  {
    type: "TOPIC",
    title: "새 토픽",
    body: "아지트에 새 토픽이 열렸습니다.",
    deepLink: "/agit",
    resourceId: "seed-topic",
    agitUuid: null,
  },
  {
    type: "POST",
    title: "새로운 글",
    body: "다이어리·피드에 새 글이 올라왔습니다.",
    deepLink: "/diary",
    resourceId: "seed-post",
    agitUuid: null,
  },
];

function emptyStore(): StoreFile {
  return { users: {} };
}

function unreadCount(items: ApiNotificationItem[]): number {
  return items.filter((item) => !item.read).length;
}

function toInbox(user: StoreUser): ApiNotificationInboxResponse {
  const items = [...user.items].sort((left, right) => {
    const leftAt = left.createdAt ?? "";
    const rightAt = right.createdAt ?? "";
    return rightAt.localeCompare(leftAt);
  });
  return { items, unreadCount: unreadCount(items) };
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!parsed || typeof parsed !== "object" || !parsed.users) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function userBucket(store: StoreFile, userUuid: string): StoreUser {
  if (!store.users[userUuid]) {
    store.users[userUuid] = { seq: 0, items: [] };
  }
  return store.users[userUuid];
}

export async function listLocalInbox(userUuid: string): Promise<ApiNotificationInboxResponse> {
  const store = await readStore();
  return toInbox(userBucket(store, userUuid));
}

export async function countLocalUnread(userUuid: string): Promise<number> {
  const inbox = await listLocalInbox(userUuid);
  return inbox.unreadCount;
}

export async function markLocalRead(userUuid: string, id: number): Promise<ApiNotificationItem> {
  const store = await readStore();
  const user = userBucket(store, userUuid);
  const item = user.items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error("알림을 찾을 수 없습니다.");
  }
  item.read = true;
  await writeStore(store);
  return item;
}

export async function markLocalAllRead(userUuid: string): Promise<number> {
  const store = await readStore();
  const user = userBucket(store, userUuid);
  let updated = 0;
  for (const item of user.items) {
    if (!item.read) {
      item.read = true;
      updated += 1;
    }
  }
  await writeStore(store);
  return updated;
}

export async function seedLocalInbox(userUuid: string): Promise<ApiNotificationInboxResponse> {
  const store = await readStore();
  const user = userBucket(store, userUuid);
  const existing = new Set(user.items.map((item) => item.resourceId));
  const now = new Date().toISOString();
  for (const seed of SEED_ITEMS) {
    if (existing.has(seed.resourceId)) {
      continue;
    }
    user.seq += 1;
    user.items.push({
      id: user.seq,
      type: seed.type as ApiNotificationType,
      title: seed.title,
      body: seed.body,
      deepLink: seed.deepLink,
      resourceId: seed.resourceId,
      agitUuid: seed.agitUuid,
      read: false,
      createdAt: now,
    });
  }
  await writeStore(store);
  return toInbox(user);
}
