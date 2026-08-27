import mysql from "mysql2/promise";
import { readEnvValue } from "@/lib/db/loadEnvFile";

const DEFAULT_DB_HOST = "192.168.10.144";
const DEFAULT_DB_PORT = 3308;

export function uuidToBin(uuid: string): Buffer {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
}

export function binToUuid(value: Buffer | Uint8Array | string): string {
  const hex = Buffer.isBuffer(value)
    ? value.toString("hex")
    : typeof value === "string"
      ? value.replace(/-/g, "")
      : Buffer.from(value).toString("hex");
  const normalized = hex.toLowerCase();
  return `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;
}

function mysqlConfig(): mysql.PoolOptions {
  return {
    host: readEnvValue("DB_HOST", DEFAULT_DB_HOST),
    port: Number(readEnvValue("MYSQL_PORT", String(DEFAULT_DB_PORT))) || DEFAULT_DB_PORT,
    user: readEnvValue("DB_USERNAME", "root"),
    password: readEnvValue("DB_PASSWORD"),
    database: "plip_user",
    waitForConnections: true,
    connectionLimit: 4,
    connectTimeout: 2500,
    namedPlaceholders: true,
  };
}

let pool: mysql.Pool | null = null;

export function getMysqlPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(mysqlConfig());
  }
  return pool;
}

export async function queryMysql<T extends mysql.RowDataPacket>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const [rows] = await getMysqlPool().query<T[]>(sql, params);
  return rows;
}

export async function executeMysql(sql: string, params?: unknown[]): Promise<void> {
  await getMysqlPool().query(sql, params);
}
