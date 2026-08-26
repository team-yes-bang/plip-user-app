import { AsyncLocalStorage } from "node:async_hooks";
import { cache } from "react";
import * as authService from "@/services/authService";

export type RequestAuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

const RETRY_REFRESH_TOKEN_KEY = "x-retry-refresh-token";

const retryAuthHeaderStore = new AsyncLocalStorage<Record<string, string>>();

export function getRetryAuthHeaders(): Record<string, string> | undefined {
  const store = retryAuthHeaderStore.getStore();
  if (!store || Object.keys(store).length === 0) {
    return undefined;
  }
  return store;
}

export async function runWithRetryAuthScope<T>(fn: () => Promise<T>): Promise<T> {
  return retryAuthHeaderStore.run({}, fn);
}

export const reissueTokensOncePerRequest = cache(async (): Promise<RequestAuthTokens | null> => {
  const { getServerRefreshToken } = await import("@/lib/auth/server-token");
  const refreshToken = await getServerRefreshToken();
  if (typeof refreshToken !== "string" || !refreshToken) {
    return null;
  }

  const refreshed = await authService.reissueToken(refreshToken);
  return {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
  };
});

export function getRetryRefreshToken(): string | undefined {
  const token = retryAuthHeaderStore.getStore()?.[RETRY_REFRESH_TOKEN_KEY];
  return typeof token === "string" && token.length > 0 ? token : undefined;
}

export function applyRetryAuthHeaders(tokens: RequestAuthTokens): void {
  const store = retryAuthHeaderStore.getStore();
  if (!store) {
    return;
  }
  store.Authorization = `Bearer ${tokens.accessToken}`;
  store[RETRY_REFRESH_TOKEN_KEY] = tokens.refreshToken;
}
