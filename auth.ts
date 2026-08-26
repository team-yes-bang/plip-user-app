import NextAuth, { CredentialsSignin } from "next-auth";
import type { Account, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import type { NextRequest } from "next/server";
import authConfig from "@/auth.config";
import { ApiError } from "@/lib/api/apiFetch";
import { AUTH_ERROR_CODES, getApiErrorCode } from "@/lib/auth/auth-errors";
import { saveSocialSignupPendingToken } from "@/lib/auth/social-signup-pending";
import { isSocialProvider } from "@/lib/auth/social-providers";
import { validateSessionTokens } from "@/lib/auth/validate-session-tokens";
import type { SocialProvider } from "@/types/auth/ui";
import * as authService from "@/services/authService";

class PendingRestoreError extends CredentialsSignin {
  code = AUTH_ERROR_CODES.PENDING_RESTORE;
}

function logLoginAccessToken(source: string, accessToken: string | undefined) {
  console.log(`[auth] ${source} accessToken`, accessToken);
}

const KakaoProvider = Kakao({
  clientId: process.env.AUTH_KAKAO_ID,
  clientSecret: process.env.AUTH_KAKAO_SECRET,
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: {
      // account_email은 사업자 등록·동의항목 설정 필요 — 미설정 시 KOE205
      scope: "profile_nickname",
    },
  },
});

const NaverProvider: Provider = {
  id: "naver",
  name: "Naver",
  type: "oauth",
  clientId: process.env.AUTH_NAVER_ID,
  clientSecret: process.env.AUTH_NAVER_SECRET,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { response_type: "code", auth_type: "reprompt" },
  },
  token: {
    url: "https://nid.naver.com/oauth2.0/token",
    params: { grant_type: "authorization_code" },
  },
  userinfo: {
    url: "https://openapi.naver.com/v1/nid/me",
    params: { response_type: "json" },
  },
  profile(profile) {
    const record = profile as {
      response?: { id?: string; email?: string; nickname?: string; name?: string };
    };
    return {
      id: record.response?.id ?? "",
      email: record.response?.email ?? null,
      name: record.response?.nickname ?? record.response?.name ?? null,
    };
  },
};

const GUEST_ONLY_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PROTECTED_PREFIXES = [
  "/home",
  "/diary",
  "/agit",
  "/mypage",
  "/shop",
  "/create",
  "/viewer",
  "/video",
  "/video-api",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function buildAuthRedirect(path: string): string {
  const base = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (!base) {
    return path;
  }
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

async function persistSocialSignupPending(
  provider: SocialProvider,
  providerAccessToken: string,
): Promise<void> {
  const pendingToken = await authService.saveSocialSignupPending(provider, providerAccessToken);
  await saveSocialSignupPendingToken(pendingToken);
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, accessToken: undefined, refreshToken: undefined };
  }

  try {
    const refreshed = await authService.reissueToken(String(token.refreshToken));
    return {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
    };
  } catch {
    return { ...token, accessToken: undefined, refreshToken: undefined };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    KakaoProvider,
    NaverProvider,
    Credentials({
      id: "session-tokens",
      credentials: {
        userUuid: { label: "User UUID", type: "text" },
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        accessTokenExpiresAt: { label: "Access Token Expires At", type: "text" },
      },
      async authorize(credentials) {
        const userUuid = credentials?.userUuid;
        const accessToken = credentials?.accessToken;
        const refreshToken = credentials?.refreshToken;
        const accessTokenExpiresAt = credentials?.accessTokenExpiresAt;

        if (
          typeof userUuid !== "string" ||
          typeof accessToken !== "string" ||
          typeof refreshToken !== "string" ||
          typeof accessTokenExpiresAt !== "string"
        ) {
          return null;
        }

        const expiresAt = Number(accessTokenExpiresAt);
        if (!userUuid || !accessToken || !refreshToken || !Number.isFinite(expiresAt)) {
          return null;
        }

        const isValid = await validateSessionTokens(userUuid, accessToken);
        if (!isValid) {
          return null;
        }

        return {
          id: userUuid,
          userUuid,
          accessToken,
          refreshToken,
          accessTokenExpiresAt: expiresAt,
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        try {
          const result = await authService.loginLocal({ email, password });
          logLoginAccessToken("local", result.accessToken);
          return {
            id: result.userUuid,
            userUuid: result.userUuid,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
          };
        } catch (error) {
          if (
            error instanceof ApiError &&
            getApiErrorCode(error.body) === AUTH_ERROR_CODES.PENDING_RESTORE
          ) {
            throw new PendingRestoreError();
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }: { auth: Session | null; request: NextRequest }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = session?.isLoggedIn === true;

      if (matchesPrefix(pathname, GUEST_ONLY_PREFIXES) && isLoggedIn) {
        return Response.redirect(new URL("/diary", request.nextUrl));
      }

      // 방 가입 랜딩 페이지(/agit/join/[code])는 비로그인 상태에서도 접근 허용
      if (
        pathname.startsWith("/agit/join/") &&
        !pathname.includes("/profile") &&
        !pathname.includes("/complete")
      ) {
        return true;
      }

      if (matchesPrefix(pathname, PROTECTED_PREFIXES) && !isLoggedIn) {
        const signInUrl = request.nextUrl.clone();
        signInUrl.pathname = "/login";
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
        return Response.redirect(signInUrl);
      }

      return true;
    },
    async signIn({ account, user }: { account?: Account | null; user: User }) {
      if (account?.provider === "credentials" || account?.provider === "session-tokens") {
        return !!user?.accessToken;
      }

      const providerAccessToken = account?.access_token;
      const provider = account?.provider;
      if (!providerAccessToken || !provider) {
        return `/login?error=OAuthCallback&provider=${provider ?? "unknown"}`;
      }

      try {
        const result = await authService.loginSocial(provider, providerAccessToken);
        logLoginAccessToken(provider, result.accessToken);
        user.id = result.userUuid;
        user.userUuid = result.userUuid;
        user.accessToken = result.accessToken;
        user.refreshToken = result.refreshToken;
        user.accessTokenExpiresAt = result.accessTokenExpiresAt;
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          const code = getApiErrorCode(error.body);
          if (code === AUTH_ERROR_CODES.PENDING_RESTORE) {
            if (isSocialProvider(provider)) {
              try {
                await persistSocialSignupPending(provider, providerAccessToken);
              } catch (pendingError) {
                console.error("[auth] social restore pending save failed", pendingError);
                return buildAuthRedirect(
                  `/login?error=social_pending&provider=${provider}`,
                );
              }
            }
            return buildAuthRedirect(`/login?restore=pending&provider=${provider}`);
          }
          if (code === AUTH_ERROR_CODES.SOCIAL_SIGNUP_REQUIRED) {
            if (!isSocialProvider(provider)) {
              return buildAuthRedirect(
                `/login?error=social_backend&provider=${provider}&status=${error.status}`,
              );
            }
            try {
              await persistSocialSignupPending(provider, providerAccessToken);
            } catch (pendingError) {
              console.error("[auth] social signup pending save failed", pendingError);
              return buildAuthRedirect(
                `/login?error=social_pending&provider=${provider}`,
              );
            }
            return buildAuthRedirect(`/signup?mode=social&provider=${provider}`);
          }
          const message =
            typeof error.body === "object" &&
            error.body !== null &&
            "message" in error.body &&
            typeof error.body.message === "string"
              ? encodeURIComponent(error.body.message)
              : encodeURIComponent(error.message);
          return `/login?error=social_backend&provider=${provider}&status=${error.status}&message=${message}`;
        }
        return `/login?error=social_backend&provider=${provider}`;
      }
    },
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session;
    }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        token.userUuid = user.userUuid ?? user.id;
      }

      if (trigger === "update" && session && typeof session === "object") {
        const patch = session as {
          accessToken?: string;
          refreshToken?: string;
          accessTokenExpiresAt?: number;
          userUuid?: string;
        };
        if (patch.accessToken) token.accessToken = patch.accessToken;
        if (patch.refreshToken) token.refreshToken = patch.refreshToken;
        if (patch.accessTokenExpiresAt) token.accessTokenExpiresAt = patch.accessTokenExpiresAt;
        if (patch.userUuid) token.userUuid = patch.userUuid;
      }

      const expiresAt = token.accessTokenExpiresAt;
      if (typeof expiresAt === "number" && Date.now() < expiresAt - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    session({ session, token }: { session: Session; token: JWT }): Session {
      const accessToken =
        typeof token.accessToken === "string" && token.accessToken.length > 0
          ? token.accessToken
          : undefined;
      const refreshToken =
        typeof token.refreshToken === "string" && token.refreshToken.length > 0
          ? token.refreshToken
          : undefined;
      const userUuid =
        typeof token.userUuid === "string" && token.userUuid.length > 0
          ? token.userUuid
          : undefined;

      return {
        expires: session.expires,
        isLoggedIn: Boolean(accessToken),
        accessToken,
        refreshToken,
        userUuid,
      };
    },
  },
});
