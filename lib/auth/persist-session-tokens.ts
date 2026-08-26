import { cookies, headers } from "next/headers";
import { encode, getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

export type PersistableSessionTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

function isProductionSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

function getSessionCookieName(): string {
  return isProductionSecureCookie() ? "__Secure-authjs.session-token" : "authjs.session-token";
}

async function readSessionJwt(): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    return null;
  }

  const headerStore = await headers();
  const cookie = headerStore.get("cookie") ?? "";

  return getToken({
    req: { headers: { cookie } },
    secret,
    secureCookie: isProductionSecureCookie(),
  });
}

export async function persistSessionTokens(tokens: PersistableSessionTokens): Promise<void> {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    return;
  }

  const existing = (await readSessionJwt()) ?? {};
  const updated: JWT = {
    ...existing,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
  };

  const sessionCookieName = getSessionCookieName();
  const encoded = await encode({
    token: updated,
    secret,
    salt: sessionCookieName,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, encoded, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProductionSecureCookie(),
  });
}
