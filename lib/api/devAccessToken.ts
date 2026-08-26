import { cache } from "react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { ApiError, apiFetch } from "@/lib/api/apiFetch";
import { getApiUrl, getDevLoginEmail, getDevLoginPassword } from "@/lib/api/env";

type LocalLoginResponse = {
  accessToken?: string;
};

export const getDevAccessToken = cache(async (): Promise<string | undefined> => {
  const email = getDevLoginEmail();
  const password = getDevLoginPassword();
  if (!email || !password) {
    return undefined;
  }

  try {
    const data = await apiFetch<LocalLoginResponse>(API_ENDPOINTS.auth.loginLocal, {
      method: "POST",
      baseUrl: getApiUrl(),
      body: { email, password },
      auth: false,
    });
    const token = data.accessToken?.trim();
    return token || undefined;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `개발용 로그인에 실패했습니다 (${error.status}): ${error.message}`,
        error.status,
        error.body,
      );
    }
    throw error;
  }
});
