import {
  FORWARDED_ACCESS_TOKEN_HEADER,
  FORWARDED_REFRESH_TOKEN_HEADER,
  FORWARDED_USER_UUID_HEADER,
} from "@/lib/auth/forwarded-auth-headers";
import { getRetryAuthHeaders } from "@/lib/auth/request-token-cache";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

function readForwardedAuthJwt(headerStore: Headers): JWT | null {
  const accessToken = headerStore.get(FORWARDED_ACCESS_TOKEN_HEADER) ?? "";
  const refreshToken = headerStore.get(FORWARDED_REFRESH_TOKEN_HEADER) ?? "";
  const userUuid = headerStore.get(FORWARDED_USER_UUID_HEADER) ?? "";

  if (!accessToken && !refreshToken && !userUuid) {
    return null;
  }

  return {
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    userUuid: userUuid || undefined,
  };
}

export async function getServerAuthJwt() {
  if (typeof window !== "undefined") {
    return null;
  }

  const headerStore = await headers();
  const forwarded = readForwardedAuthJwt(headerStore);
  if (forwarded) {
    return forwarded;
  }

  const cookie = headerStore.get("cookie") ?? "";

  return getToken({
    req: { headers: { cookie } },
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
}

async function getServerAuthJwtSafe() {
  try {
    return await getServerAuthJwt();
  } catch {
    return null;
  }
}

export async function getServerUserUuid(): Promise<string | undefined> {
  const jwt = await getServerAuthJwtSafe();
  return typeof jwt?.userUuid === "string" && jwt.userUuid.length > 0 ? jwt.userUuid : undefined;
}

export async function getServerAccessToken(): Promise<string | undefined> {
  const retryHeaders = getRetryAuthHeaders();
  const retryToken = retryHeaders?.Authorization?.replace(/^Bearer\s+/i, "").trim();
  if (retryToken) {
    return retryToken;
  }

  const jwt = await getServerAuthJwtSafe();
  const token = jwt?.accessToken;
  return typeof token === "string" && token.length > 0 ? token : undefined;
}

export async function getServerRefreshToken(): Promise<string | undefined> {
  const jwt = await getServerAuthJwtSafe();
  const token = jwt?.refreshToken;
  return typeof token === "string" && token.length > 0 ? token : undefined;
}

export async function getSessionAuthHeaders(): Promise<Record<string, string>> {
  const jwt = await getServerAuthJwtSafe();
  const retryHeaders = getRetryAuthHeaders();

  const accessToken =
    retryHeaders?.Authorization?.replace(/^Bearer\s+/i, "").trim() ||
    (typeof jwt?.accessToken === "string" && jwt.accessToken.length > 0
      ? jwt.accessToken
      : undefined);
  const userUuid =
    typeof jwt?.userUuid === "string" && jwt.userUuid.length > 0 ? jwt.userUuid : undefined;

  const sessionHeaders: Record<string, string> = {};
  if (accessToken) {
    sessionHeaders.Authorization = `Bearer ${accessToken}`;
  }
  if (userUuid) {
    // Canonical gateway / video header (legacy X-User-Uuid still accepted by video filter)
    sessionHeaders["X-User-UUID"] = userUuid;
  }
  return sessionHeaders;
}
