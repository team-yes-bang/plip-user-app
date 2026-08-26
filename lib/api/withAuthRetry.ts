import { ApiError } from "@/lib/api/apiFetch";
import { clearDevAccessToken } from "@/lib/api/devAccessToken";
import {
  getRequestAuthTokenOverride,
  withReissueSingleFlight,
} from "@/lib/auth/request-token-cache";
import * as authService from "@/services/authService";

export async function withAuthRetry<T>(request: () => Promise<T>): Promise<T> {
  const hadOverride = Boolean(getRequestAuthTokenOverride());

  try {
    return await request();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    clearDevAccessToken();

    if (typeof window !== "undefined") {
      throw error;
    }

    if (hadOverride) {
      throw error;
    }

    await withReissueSingleFlight(async () => {
      const overrideRefresh = getRequestAuthTokenOverride()?.refreshToken;
      const { getServerRefreshToken } = await import("@/lib/auth/server-token");
      const refreshToken = overrideRefresh ?? (await getServerRefreshToken());
      if (typeof refreshToken !== "string" || !refreshToken) {
        throw error;
      }

      const refreshed = await authService.reissueToken(refreshToken);
      return {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
      };
    });

    return await request();
  }
}
