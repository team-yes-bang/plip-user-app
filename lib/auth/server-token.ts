import {
  FORWARDED_ACCESS_TOKEN_HEADER,
  FORWARDED_REFRESH_TOKEN_HEADER,
  FORWARDED_USER_UUID_HEADER,
} from "@/lib/auth/forwarded-auth-headers";
import { persistSessionTokens } from "@/lib/auth/persist-session-tokens";
import {
  applyRetryAuthHeaders,
  getRetryAuthHeaders,
  getRetryRefreshToken,
  reissueTokensOncePerRequest,
} from "@/lib/auth/request-token-cache";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

const TOKEN_REFRESH_SKEW_MS = 60_000;

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

function isAccessTokenStale(accessToken: string | undefined, expiresAt: unknown): boolean {
  if (!accessToken) {
    return true;
  }

  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
    return false;
  }

  return Date.now() >= expiresAt - TOKEN_REFRESH_SKEW_MS;
}

async function readAuthSession(): Promise<Session | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    const { auth } = await import("@/auth");
    return (await auth()) ?? null;
  } catch {
    return null;
  }
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

type ResolvedSessionTokens = {
  accessToken?: string;
  refreshToken?: string;
  userUuid?: string;
};

async function resolveSessionTokens(): Promise<ResolvedSessionTokens> {
  const retryHeaders = getRetryAuthHeaders();
  const retryAccessToken = retryHeaders?.Authorization?.replace(/^Bearer\s+/i, "").trim();
  const retryRefreshToken = getRetryRefreshToken();

  const [session, jwt] = await Promise.all([readAuthSession(), getServerAuthJwtSafe()]);

  let accessToken = retryAccessToken || session?.accessToken || jwt?.accessToken;
  let refreshToken = retryRefreshToken || session?.refreshToken || jwt?.refreshToken;
  const userUuid = session?.userUuid || jwt?.userUuid;

  const needsRefresh =
    isAccessTokenStale(accessToken, jwt?.accessTokenExpiresAt) &&
    typeof refreshToken === "string" &&
    refreshToken.length > 0;

  if (needsRefresh) {
    const refreshed = await reissueTokensOncePerRequest();
    if (refreshed) {
      applyRetryAuthHeaders(refreshed);
      await persistSessionTokens(refreshed);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
    }
  }

  return { accessToken, refreshToken, userUuid };
}

export async function getServerUserUuid(): Promise<string | undefined> {
  const { userUuid } = await resolveSessionTokens();
  return typeof userUuid === "string" && userUuid.length > 0 ? userUuid : undefined;
}

export async function getServerAccessToken(): Promise<string | undefined> {
  const { accessToken } = await resolveSessionTokens();
  return typeof accessToken === "string" && accessToken.length > 0 ? accessToken : undefined;
}

export async function getServerRefreshToken(): Promise<string | undefined> {
  const { refreshToken } = await resolveSessionTokens();
  return typeof refreshToken === "string" && refreshToken.length > 0 ? refreshToken : undefined;
}

export async function getSessionAuthHeaders(): Promise<Record<string, string>> {
  const { accessToken, userUuid } = await resolveSessionTokens();

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
