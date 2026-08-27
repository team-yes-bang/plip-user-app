import { ROUTES } from "@/config/routes";
import { binToUuid, executeMysql, queryMysql, uuidToBin } from "@/lib/db/mysql";
import { INBOX_COPY, type UiInboxNotification, type UiInboxNotificationType } from "@/types/notification/ui";
import type { RowDataPacket } from "mysql2";

type PendingJoinRow = RowDataPacket & {
  amp_id: number;
  requester_uuid: Buffer;
  requester_nickname: string;
  agit_uuid: Buffer;
  agit_name: string;
  requested_at: Date | string | null;
};

type StoredInboxRow = RowDataPacket & {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link_path: string | null;
  read_at: Date | string | null;
  created_at: Date | string | null;
};

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function ensureInboxTable(): Promise<void> {
  await executeMysql(
    `CREATE TABLE IF NOT EXISTS plip_user.user_inbox_notifications (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_uuid BINARY(16) NOT NULL,
      type VARCHAR(40) NOT NULL,
      title VARCHAR(200) NOT NULL,
      body VARCHAR(500) NULL,
      link_path VARCHAR(255) NULL,
      agit_uuid BINARY(16) NULL,
      read_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_inbox_user_created (user_uuid, created_at)
    )`,
  );
}

export async function listLiveJoinRequestNotifications(
  hostUserUuid: string,
): Promise<UiInboxNotification[]> {
  const rows = await queryMysql<PendingJoinRow>(
    `SELECT
        m.id AS amp_id,
        m.user_uuid AS requester_uuid,
        m.nickname AS requester_nickname,
        a.agit_uuid AS agit_uuid,
        a.agit_name AS agit_name,
        m.updated_at AS requested_at
      FROM plip_agit.agit_member_profiles m
      JOIN plip_agit.agits a ON a.id = m.agit_id
      JOIN plip_agit.agit_member_profiles h
        ON h.agit_id = a.id AND h.role = 'HOST' AND h.status = 'ACTIVE'
      WHERE h.user_uuid = ?
        AND m.status = 'PENDING'
        AND (a.status = 'ACTIVE' OR a.status IS NULL)
      ORDER BY m.updated_at DESC
      LIMIT 200`,
    [uuidToBin(hostUserUuid)],
  );

  return rows.map((row) => {
    const agitId = binToUuid(row.agit_uuid);
    return {
      id: `live:${agitId}:${row.amp_id}`,
      type: "JOIN_REQUESTED",
      title: INBOX_COPY.JOIN_REQUESTED,
      body: `${row.requester_nickname}님이 ${row.agit_name}에 입장 요청을 보냈어요`,
      href: ROUTES.agit.manage(agitId),
      createdAt: toIso(row.requested_at),
      unread: true,
    };
  });
}

export async function listStoredInboxNotifications(
  userUuid: string,
): Promise<UiInboxNotification[]> {
  await ensureInboxTable();
  const rows = await queryMysql<StoredInboxRow>(
    `SELECT id, type, title, body, link_path, read_at, created_at
       FROM plip_user.user_inbox_notifications
      WHERE user_uuid = ?
      ORDER BY created_at DESC
      LIMIT 200`,
    [uuidToBin(userUuid)],
  );

  return rows.map((row) => ({
    id: `stored:${row.id}`,
    type: (row.type as UiInboxNotificationType) || "JOIN_REQUESTED",
    title: row.title,
    body: row.body ?? "",
    href: row.link_path || ROUTES.notifications,
    createdAt: toIso(row.created_at),
    unread: !row.read_at,
  }));
}

export async function listInboxNotifications(userUuid: string): Promise<UiInboxNotification[]> {
  const [live, stored] = await Promise.all([
    listLiveJoinRequestNotifications(userUuid).catch(() => [] as UiInboxNotification[]),
    listStoredInboxNotifications(userUuid).catch(() => [] as UiInboxNotification[]),
  ]);

  return [...live, ...stored].sort((left, right) => {
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
    return rightTime - leftTime;
  });
}

export async function countUnreadInbox(userUuid: string): Promise<number> {
  const items = await listInboxNotifications(userUuid);
  return items.filter((item) => item.unread).length;
}

export async function appendInboxNotification(input: {
  userUuid: string;
  type: UiInboxNotificationType;
  title?: string;
  body: string;
  href?: string;
  agitUuid?: string;
}): Promise<void> {
  await ensureInboxTable();
  await executeMysql(
    `INSERT INTO plip_user.user_inbox_notifications
      (user_uuid, type, title, body, link_path, agit_uuid, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      uuidToBin(input.userUuid),
      input.type,
      input.title ?? INBOX_COPY[input.type],
      input.body,
      input.href ?? null,
      input.agitUuid ? uuidToBin(input.agitUuid) : null,
    ],
  );
}

export async function markInboxNotificationRead(id: string, userUuid: string): Promise<void> {
  if (!id.startsWith("stored:")) return;
  const numericId = Number(id.slice("stored:".length));
  if (!Number.isInteger(numericId)) return;
  await executeMysql(
    `UPDATE plip_user.user_inbox_notifications
        SET read_at = COALESCE(read_at, NOW())
      WHERE id = ? AND user_uuid = ?`,
    [numericId, uuidToBin(userUuid)],
  );
}
