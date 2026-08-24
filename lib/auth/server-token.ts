import { getRequestAccessTokenOverride } from "@/lib/auth/request-token-cache";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

export async function getServerAuthJwt() {
  if (typeof window !== "undefined") {
    return null;
  }

  const headerStore = await headers();
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
  const override = getRequestAccessTokenOverride();
  if (override) {
    return override;
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
  const override = getRequestAccessTokenOverride();
  if (override) {
    return { Authorization: `Bearer ${override}` };
  }

  const jwt = await getServerAuthJwtSafe();
  if (!jwt) {
    return {};
  }

  const sessionHeaders: Record<string, string> = {};
  if (typeof jwt.accessToken === "string" && jwt.accessToken) {
    sessionHeaders.Authorization = `Bearer ${jwt.accessToken}`;
  }
  if (typeof jwt.userUuid === "string" && jwt.userUuid) {
    sessionHeaders["X-User-Uuid"] = jwt.userUuid;
  }
  return sessionHeaders;
}
