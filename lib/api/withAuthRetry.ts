import { ApiError } from "@/lib/api/apiFetch";
import {
  applyRetryAuthHeaders,
  reissueTokensOncePerRequest,
  runWithRetryAuthScope,
} from "@/lib/auth/request-token-cache";

export async function withAuthRetry<T>(request: () => Promise<T>): Promise<T> {
  return runWithRetryAuthScope(async () => {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      if (typeof window !== "undefined") {
        throw error;
      }

      const refreshed = await reissueTokensOncePerRequest();
      if (!refreshed) {
        throw error;
      }

      applyRetryAuthHeaders(refreshed);
      return await request();
    }
  });
}
