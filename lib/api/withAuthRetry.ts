import { ApiError } from "@/lib/api/apiFetch";
import { clearDevAccessToken } from "@/lib/api/devAccessToken";
import {
  clearRequestAccessTokenOverride,
  getRequestAccessTokenOverride,
  setRequestAccessTokenOverride,
} from "@/lib/auth/request-token-cache";
import { getServerAuthJwt } from "@/lib/auth/server-token";
import * as authService from "@/services/authService";

export async function withAuthRetry<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    clearDevAccessToken();

    const override = getRequestAccessTokenOverride();
    if (override) {
      clearRequestAccessTokenOverride();
      throw error;
    }

    if (typeof window !== "undefined") {
      throw error;
    }

    const jwt = await getServerAuthJwt();
    const refreshToken = jwt?.refreshToken;
    if (typeof refreshToken !== "string" || !refreshToken) {
      throw error;
    }

    try {
      const refreshed = await authService.reissueToken(refreshToken);
      setRequestAccessTokenOverride(refreshed.accessToken);
      return await request();
    } finally {
      clearRequestAccessTokenOverride();
    }
  }
}
