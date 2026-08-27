/**
 * Discover / 입장요청 더미 시드 (additive, 기존 DB를 drop 하지 않음)
 *
 * Dummy 계정
 *   email   : dummy+{n}@plip.local   (n = 1..)
 *   password: Dummy1234!
 *
 * 실행
 *   npm run seed:discover-agits
 *   node scripts/seed-discover-agits.mjs
 *
 * 환경변수(선택)
 *   SEED_HOST_LIMIT=10          실유저가 50명을 넘으면 기본 10명으로 캡
 *   SEED_AGITS_PER_HOST=100
 *   SEED_DUMMY_USERS=20
 *   API_URL=http://192.168.10.144:8000
 *   AGIT_DIRECT_URL=http://192.168.10.144:8083
 *   TOPIC_DIRECT_URL=http://192.168.10.144:8804
 *
 * DB_PASSWORD 는 C:\dev\plip-user-app\env 에서 읽습니다. 비밀값은 로그에 찍지 않습니다.
 */

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DUMMY_PASSWORD = "Dummy1234!";
const DUMMY_EMAIL_RE = /^dummy\+\d+@plip\.local$/i;
const SEED_MARKER = "[seed-discover]";
const AGITS_PER_HOST = Number(process.env.SEED_AGITS_PER_HOST || 100);
const DUMMY_USER_COUNT = Number(process.env.SEED_DUMMY_USERS || 20);
const PENDING_PER_HOST = Number(process.env.SEED_PENDING_AGITS_PER_HOST || 10);
const DEFAULT_HOST = "192.168.10.144";
const DEFAULT_API = `http://${DEFAULT_HOST}:8000`;
const DEFAULT_AGIT_DIRECT = `http://${DEFAULT_HOST}:8083`;
const DEFAULT_TOPIC_DIRECT = `http://${DEFAULT_HOST}:8804`;

function loadEnvFile() {
  const out = {};
  for (const file of [resolve(ROOT, "env"), resolve(ROOT, ".env"), resolve(ROOT, ".env.local")]) {
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[line.slice(0, eq).trim()] = value;
    }
  }
  return out;
}

const fileEnv = loadEnvFile();
function env(name, fallback = "") {
  return (process.env[name] || fileEnv[name] || fallback).trim();
}

function uuidToBin(uuid) {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
}

function binToUuid(value) {
  const hex = Buffer.isBuffer(value)
    ? value.toString("hex")
    : Buffer.from(value).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sanitizeNickname(raw, fallback) {
  const cleaned = String(raw || "").replace(/[^0-9A-Za-z가-힣]/g, "").slice(0, 12);
  return cleaned.length >= 2 ? cleaned : fallback;
}

function inviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function mapPool(items, limit, worker) {
  const results = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { ok: response.ok, status: response.status, data };
}

async function probeUrl(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  const dbHost = env("DB_HOST", DEFAULT_HOST);
  const dbPort = Number(env("MYSQL_PORT", "3308")) || 3308;
  const dbUser = env("DB_USERNAME", "root");
  const dbPassword = env("DB_PASSWORD");
  if (!dbPassword) {
    throw new Error("DB_PASSWORD 가 env 파일에 없습니다.");
  }

  const apiUrl = env("API_URL", DEFAULT_API).replace(/\/$/, "");
  const agitDirect = env("AGIT_DIRECT_URL", DEFAULT_AGIT_DIRECT).replace(/\/$/, "");
  const topicDirect = env("TOPIC_DIRECT_URL", DEFAULT_TOPIC_DIRECT).replace(/\/$/, "");

  const conn = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true,
  });

  const stats = {
    realUsersTotal: 0,
    hostsUsed: 0,
    dummyUsersCreated: 0,
    dummyUsersReused: 0,
    agitsCreated: 0,
    agitsReused: 0,
    activeJoins: 0,
    pendingRequests: 0,
    leaves: 0,
    topicsCreated: 0,
    notifications: 0,
    catalogRows: 0,
    apiCreates: 0,
    sqlCreates: 0,
  };

  try {
    console.log(`[seed] mysql ${dbHost}:${dbPort} (password hidden)`);
    console.log(`[seed] api ${apiUrl}`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS plip_user.user_inbox_notifications (
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
      )
    `);

    const [userRows] = await conn.query(`
      SELECT
        u.id,
        u.user_uuid,
        u.nickname,
        u.status,
        ua.email
      FROM plip_user.users u
      LEFT JOIN plip_user.user_auths ua
        ON ua.user_id = u.id AND ua.auth_type = 'LOCAL' AND ua.deleted_at IS NULL
      WHERE u.deleted_at IS NULL AND u.status = 'ACTIVE'
      ORDER BY u.id ASC
    `);

    const realUsers = userRows
      .map((row) => ({
        id: row.id,
        userUuid: binToUuid(row.user_uuid),
        nickname: row.nickname,
        email: row.email || "",
      }))
      .filter((row) => row.userUuid && !DUMMY_EMAIL_RE.test(row.email));

    stats.realUsersTotal = realUsers.length;
    const hostLimitEnv = process.env.SEED_HOST_LIMIT;
    const hostLimit =
      hostLimitEnv !== undefined && hostLimitEnv !== ""
        ? Number(hostLimitEnv)
        : realUsers.length > 50
          ? 10
          : realUsers.length;
    const hosts = realUsers.slice(0, Math.max(0, hostLimit));
    stats.hostsUsed = hosts.length;
    if (realUsers.length > 50 && !hostLimitEnv) {
      console.log(
        `[seed] real users=${realUsers.length} → cap first ${hosts.length} (set SEED_HOST_LIMIT to override)`,
      );
    } else {
      console.log(`[seed] real users=${realUsers.length}, hosts used=${hosts.length}`);
    }
    if (hosts.length === 0) {
      throw new Error("시드할 실유저가 없습니다.");
    }

    const passwordHash = await bcrypt.hash(DUMMY_PASSWORD, 10);
    const dummyUsers = [];
    for (let n = 1; n <= DUMMY_USER_COUNT; n += 1) {
      const email = `dummy+${n}@plip.local`;
      const [existing] = await conn.query(
        `SELECT u.id, u.user_uuid, u.nickname, ua.email
           FROM plip_user.user_auths ua
           JOIN plip_user.users u ON u.id = ua.user_id
          WHERE ua.email = ? AND ua.auth_type = 'LOCAL' AND ua.deleted_at IS NULL
          LIMIT 1`,
        [email],
      );
      if (existing[0]) {
        dummyUsers.push({
          id: existing[0].id,
          userUuid: binToUuid(existing[0].user_uuid),
          nickname: existing[0].nickname,
          email,
        });
        stats.dummyUsersReused += 1;
        continue;
      }

      const userUuid = randomUUID();
      const nickname = `더미${n}`;
      const [insertUser] = await conn.query(
        `INSERT INTO plip_user.users
          (user_uuid, nickname, profile_image_path, status, created_at, updated_at)
         VALUES (?, ?, NULL, 'ACTIVE', NOW(), NOW())`,
        [uuidToBin(userUuid), nickname],
      );
      const userId = insertUser.insertId;
      await conn.query(
        `INSERT INTO plip_user.user_auths
          (user_id, auth_type, email, password_hash, created_at, updated_at)
         VALUES (?, 'LOCAL', ?, ?, NOW(), NOW())`,
        [userId, email, passwordHash],
      );
      await conn.query(
        `INSERT INTO plip_user.user_notification_settings
          (user_id, agit_notify_enabled, diary_notify_enabled, diary_notify_time, created_at, updated_at)
         VALUES (?, 1, 1, '21:00:00', NOW(), NOW())`,
        [userId],
      );
      await conn.query(
        `INSERT INTO plip_user.user_terms_agreements
          (user_id, term_id, is_agreed, agreed_at, created_at, updated_at)
         SELECT ?, id, 1, NOW(), NOW(), NOW()
           FROM plip_user.terms
          WHERE is_required = 1 AND status = 'ACTIVE'`,
        [userId],
      );
      dummyUsers.push({ id: userId, userUuid, nickname, email });
      stats.dummyUsersCreated += 1;
    }
    console.log(
      `[seed] dummy users created=${stats.dummyUsersCreated} reused=${stats.dummyUsersReused} password=Dummy1234!`,
    );

    const dummyTokens = new Map();
    for (const dummy of dummyUsers) {
      const login = await jsonFetch(`${apiUrl}/api/user/api/v1/auth/login/local`, {
        method: "POST",
        body: { email: dummy.email, password: DUMMY_PASSWORD },
      });
      if (login.ok && login.data?.accessToken) {
        dummyTokens.set(dummy.userUuid, login.data.accessToken);
      }
    }
    console.log(`[seed] dummy logins via gateway: ${dummyTokens.size}/${dummyUsers.length}`);

    const agitDirectOk = await probeUrl(`${agitDirect}/actuator/health`);
    const topicDirectOk = await probeUrl(`${topicDirect}/actuator/health`);
    console.log(`[seed] agit direct ${agitDirect} reachable=${agitDirectOk}`);
    console.log(`[seed] topic direct ${topicDirect} reachable=${topicDirectOk}`);

    async function createAgitViaApi(host, name, description) {
      const nickname = sanitizeNickname(host.nickname, `호스트${host.id}`);
      const body = {
        agitName: name,
        description,
        maximumCapacity: 5,
        nickname,
      };
      if (agitDirectOk) {
        const created = await jsonFetch(`${agitDirect}/api/v1/agits`, {
          method: "POST",
          headers: { "X-User-UUID": host.userUuid },
          body,
        });
        if (created.ok && created.data?.agitUuid) {
          stats.apiCreates += 1;
          return created.data;
        }
      }
      return null;
    }

    async function createAgitViaSql(host, name, description) {
      const agitUuid = randomUUID();
      let code = inviteCode();
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const [dup] = await conn.query(
          `SELECT id FROM plip_agit.agits WHERE code = ? LIMIT 1`,
          [code],
        );
        if (!dup[0]) break;
        code = inviteCode();
      }
      const [insertAgit] = await conn.query(
        `INSERT INTO plip_agit.agits
          (agit_uuid, agit_name, description, maximum_capacity, code, status, created_at, updated_at)
         VALUES (?, ?, ?, 5, ?, 'ACTIVE', NOW(), NOW())`,
        [uuidToBin(agitUuid), name, description, code],
      );
      const agitId = insertAgit.insertId;
      await conn.query(
        `INSERT INTO plip_agit.agit_member_profiles
          (agit_id, user_uuid, nickname, status, role, created_at, updated_at)
         VALUES (?, ?, ?, 'ACTIVE', 'HOST', NOW(), NOW())`,
        [agitId, uuidToBin(host.userUuid), sanitizeNickname(host.nickname, `호스트${host.id}`)],
      );
      try {
        await conn.query(
          `INSERT INTO plip_analytics.agit_catalog
            (agit_uuid, agit_name, description, thumbnail_path, status, created_at)
           VALUES (?, ?, ?, NULL, 'ACTIVE', NOW())
           ON DUPLICATE KEY UPDATE agit_name = VALUES(agit_name), description = VALUES(description)`,
          [agitUuid, name, description],
        );
        stats.catalogRows += 1;
      } catch {
        // analytics schema 가 없으면 건너뜀
      }
      stats.sqlCreates += 1;
      return { agitUuid, code, agitName: name };
    }

    async function joinByCode(dummy, code, nickname) {
      const token = dummyTokens.get(dummy.userUuid);
      if (token) {
        const joined = await jsonFetch(`${apiUrl}/api/agit/api/v1/agits/${encodeURIComponent(code)}/join`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: { nickname },
        });
        if (joined.ok) return true;
      }
      if (agitDirectOk) {
        const joined = await jsonFetch(`${agitDirect}/api/v1/agits/${encodeURIComponent(code)}/join`, {
          method: "POST",
          headers: { "X-User-UUID": dummy.userUuid },
          body: { nickname },
        });
        if (joined.ok) return true;
      }
      return false;
    }

    async function requestJoin(dummy, agitUuid, nickname) {
      const token = dummyTokens.get(dummy.userUuid);
      if (token) {
        const requested = await jsonFetch(`${apiUrl}/api/agit/api/v1/agits/${agitUuid}/join-requests`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: { nickname },
        });
        if (requested.ok) return true;
      }
      if (agitDirectOk) {
        const requested = await jsonFetch(`${agitDirect}/api/v1/agits/${agitUuid}/join-requests`, {
          method: "POST",
          headers: { "X-User-UUID": dummy.userUuid },
          body: { nickname },
        });
        if (requested.ok) return true;
      }
      return false;
    }

    async function leaveAgit(dummy, agitUuid) {
      const token = dummyTokens.get(dummy.userUuid);
      if (token) {
        const left = await jsonFetch(`${apiUrl}/api/agit/api/v1/agits/${agitUuid}/leave`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (left.ok || left.status === 204) return true;
      }
      if (agitDirectOk) {
        const left = await jsonFetch(`${agitDirect}/api/v1/agits/${agitUuid}/leave`, {
          method: "POST",
          headers: { "X-User-UUID": dummy.userUuid },
        });
        if (left.ok || left.status === 204) return true;
      }
      return false;
    }

    async function createTopic(host, agitUuid, title) {
      const body = { agitUuid, title };
      if (topicDirectOk) {
        const created = await jsonFetch(`${topicDirect}/api/v1/topics`, {
          method: "POST",
          headers: { "X-User-UUID": host.userUuid },
          body,
        });
        if (created.ok) return true;
      }
      const created = await jsonFetch(`${apiUrl}/api/topic/api/v1/topics`, {
        method: "POST",
        headers: { "X-User-UUID": host.userUuid },
        body,
      });
      if (created.ok) return true;
      try {
        await conn.query(
          `INSERT INTO plip_topic.topic
            (topic_uuid, agit_uuid, creator_uuid, title, start_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [uuidToBin(randomUUID()), uuidToBin(agitUuid), uuidToBin(host.userUuid), title],
        );
        return true;
      } catch {
        return false;
      }
    }

    async function insertNotification(userUuid, type, title, body, linkPath, agitUuid) {
      await conn.query(
        `INSERT INTO plip_user.user_inbox_notifications
          (user_uuid, type, title, body, link_path, agit_uuid, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [uuidToBin(userUuid), type, title, body, linkPath, agitUuid ? uuidToBin(agitUuid) : null],
      );
      stats.notifications += 1;
    }

    for (const [hostIndex, host] of hosts.entries()) {
      const [existingSeed] = await conn.query(
        `SELECT
            a.id,
            a.agit_uuid,
            a.agit_name,
            a.code,
            a.description
           FROM plip_agit.agits a
           JOIN plip_agit.agit_member_profiles m
             ON m.agit_id = a.id AND m.role = 'HOST' AND m.user_uuid = ?
          WHERE a.description LIKE ?
          ORDER BY a.id ASC`,
        [uuidToBin(host.userUuid), `${SEED_MARKER}%`],
      );

      const owned = existingSeed.map((row) => ({
        agitUuid: binToUuid(row.agit_uuid),
        agitName: row.agit_name,
        code: row.code,
      }));
      stats.agitsReused += owned.length;

      const missing = Math.max(0, AGITS_PER_HOST - owned.length);
      console.log(
        `[seed] host ${hostIndex + 1}/${hosts.length} ${host.nickname} existingSeed=${owned.length} create=${missing}`,
      );

      const toCreate = Array.from({ length: missing }, (_, offset) => owned.length + offset + 1);
      await mapPool(toCreate, 4, async (seq) => {
        const name = `시드${hostIndex + 1}-${String(seq).padStart(3, "0")}`;
        const description = `${SEED_MARKER} ${host.nickname} 더미 아지트 ${seq}`;
        let created = await createAgitViaApi(host, name, description);
        if (!created) {
          created = await createAgitViaSql(host, name, description);
        }
        if (created?.agitUuid) {
          owned.push({
            agitUuid: created.agitUuid,
            agitName: created.agitName || name,
            code: created.code,
          });
          stats.agitsCreated += 1;
        }
      });

      await mapPool(owned, 3, async (agit, agitIndex) => {
        const memberA = dummyUsers[(hostIndex + agitIndex) % dummyUsers.length];
        const memberB = dummyUsers[(hostIndex + agitIndex + 1) % dummyUsers.length];
        const pending = dummyUsers[(hostIndex + agitIndex + 2) % dummyUsers.length];
        const leaver = dummyUsers[(hostIndex + agitIndex + 3) % dummyUsers.length];

        if (memberA && agit.code && memberA.userUuid !== host.userUuid) {
          if (await joinByCode(memberA, agit.code, memberA.nickname)) {
            stats.activeJoins += 1;
          }
        }
        if (memberB && agit.code && memberB.userUuid !== host.userUuid && memberB !== memberA) {
          if (await joinByCode(memberB, agit.code, memberB.nickname)) {
            stats.activeJoins += 1;
          }
        }

        if (agitIndex < PENDING_PER_HOST && pending && pending.userUuid !== host.userUuid) {
          if (await requestJoin(pending, agit.agitUuid, pending.nickname)) {
            stats.pendingRequests += 1;
          }
        }

        if (agitIndex % 10 === 0 && leaver && agit.code && leaver.userUuid !== host.userUuid) {
          if (await joinByCode(leaver, agit.code, leaver.nickname)) {
            stats.activeJoins += 1;
            if (await leaveAgit(leaver, agit.agitUuid)) {
              stats.leaves += 1;
            }
          }
        }

        let hasTopic = false;
        try {
          const [existingTopic] = await conn.query(
            `SELECT id FROM plip_topic.topic WHERE agit_uuid = ? AND deleted_at IS NULL LIMIT 1`,
            [uuidToBin(agit.agitUuid)],
          );
          hasTopic = Boolean(existingTopic[0]);
        } catch {
          hasTopic = false;
        }
        if (!hasTopic && (await createTopic(host, agit.agitUuid, "시드토픽"))) {
          stats.topicsCreated += 1;
        }
      });
    }

    console.log("[seed] done");
    console.log(JSON.stringify(stats, null, 2));
    console.log("[seed] dummy login: dummy+1@plip.local / Dummy1234!");
    console.log("[seed] 승인 페이지: 호스트 계정으로 로그인 → 아지트 → 메뉴 → 아지트관리");
    console.log("[seed] 알림함: 종 아이콘 또는 /mypage/inbox");
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error("[seed] failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
